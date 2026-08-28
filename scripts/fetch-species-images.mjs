#!/usr/bin/env node
import { mkdir, readFile, writeFile, access, unlink } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const USER_AGENT = 'FishCareAIImagePipeline/1.0 (https://www.fishcareai.com/contact/)'
const ALLOWED_LICENSE = /^(CC0|CC BY(?:-SA)?(?: [1-4]\.0)?|Public domain|PD|Attribution|No restrictions)/i
const root = resolve(process.argv[2] || process.cwd())
const sourceFile = resolve(process.argv[3] || '/private/tmp/fishcareai-species.md')
const realDir = join(root, 'public/assets/encyclopedia/real')
const manifestFile = join(realDir, 'real-image-sources.json')
const reviewFile = join(realDir, 'image-review-needed.json')
const overwrite = process.argv.includes('--overwrite')
const refreshMetadata = process.argv.includes('--refresh-metadata')
const COMMONS_OVERRIDES = new Map([
  ['Oliotius oligolepis', 'Puntius oligolepis.jpg'],
  ['Desmopuntius everetti', 'Clownbarbe 2.jpg'],
  ['Dichotomyctere ocellatus', 'Figure8pufferfish.jpg'],
  ['Barbodes semifasciolatus', 'Gold Barb Puntius semifasciolatus 6.png'],
  ['Mesoheros festae', 'Red Terror Festae Chiclid.jpg'],
])
const COMMONS_FILE_OVERRIDES = new Map([
  ['blood-parrot-cichlid-wikimedia-real.jpg', 'Blood parrot cichlid 2010 G1.JPG'],
  ['flowerhorn-cichlid-wikimedia-real.jpg', 'Flowerhorn cichlid.jpg'],
  ['harlequin-rasbora-wikimedia-real.jpg', 'Cyprinidae Trigonostigma heteromorpha 3.jpg'],
  ['tiger-barb-wikimedia-real.jpg', 'Tiger Barb 700.jpg'],
  ['zebra-danio-wikimedia-real.jpg', 'Danio rerio.JPG'],
])
const GENERATED_ART = new Map([
  ['fireline-devario-wikimedia-real.jpg', { commonName: 'Fireline Devario', scientificName: 'Devario sondhii', generator: 'OpenAI image generation', description: 'AI-generated scientific illustration used because no commercially reusable species photograph was available.' }],
  ['kigoma-cichlid-wikimedia-real.jpg', { commonName: 'Kigoma Cichlid', scientificName: 'Tropheus brichardi', generator: 'OpenAI image generation', description: 'AI-generated scientific illustration used because available species photographs prohibited commercial use.' }],
  ['panda-loach-wikimedia-real.jpg', { commonName: 'Panda Loach', scientificName: 'Yaoshania pachychilus', generator: 'OpenAI image generation', description: 'AI-generated scientific illustration used because available species photographs prohibited commercial use.' }],
])
const sleep = ms => new Promise(done => setTimeout(done, ms))
const clean = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

async function getJson(url, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.ok) return response.json()
    if (attempt === attempts) throw new Error(`${response.status} ${url}`)
    await sleep(500 * attempt)
  }
}

function parseSpecies(markdown) {
  const regex = /\[!\[Image \d+: ([^\]]+)\]\((https:\/\/www\.fishcareai\.com\/assets\/encyclopedia\/real\/([^\s)]+))\)(?:Freshwater|Marine|Brackish) \*\*([^*]+)\*\*_([^_]+)_ Family:/g
  const rows = []
  let match
  while ((match = regex.exec(markdown))) rows.push({ filename: match[3], commonName: match[4], scientificName: match[5] })
  if (rows.length !== 257) throw new Error(`Expected 257 species, parsed ${rows.length}`)
  return rows
}

async function findTaxon(scientificName) {
  const params = new URLSearchParams({ action: 'wbsearchentities', search: scientificName, language: 'en', uselang: 'en', type: 'item', limit: '10', format: 'json', origin: '*' })
  const data = await getJson(`https://www.wikidata.org/w/api.php?${params}`)
  const wanted = scientificName.toLowerCase()
  return data.search?.find(item => item.label?.toLowerCase() === wanted || item.aliases?.some(alias => alias.toLowerCase() === wanted)) || null
}

async function getP18(entityId) {
  const params = new URLSearchParams({ action: 'wbgetentities', ids: entityId, props: 'claims|labels', languages: 'en', format: 'json', origin: '*' })
  const data = await getJson(`https://www.wikidata.org/w/api.php?${params}`)
  const entity = data.entities?.[entityId]
  const claim = entity?.claims?.P18?.find(entry => entry.rank !== 'deprecated' && entry.mainsnak?.datavalue?.value)
  return claim?.mainsnak?.datavalue?.value || null
}

async function getCommonsInfo(fileName) {
  const params = new URLSearchParams({ action: 'query', titles: `File:${fileName}`, prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '1600', format: 'json', origin: '*' })
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`)
  const page = Object.values(data.query?.pages || {})[0]
  const info = page?.imageinfo?.[0]
  if (!info) return null
  const meta = info.extmetadata || {}
  return { commonsFile: fileName, sourcePage: info.descriptionurl, downloadUrl: info.thumburl || info.url, mime: info.thumbmime || info.mime, width: info.thumbwidth || info.width, height: info.thumbheight || info.height, author: clean(meta.Artist?.value || meta.Credit?.value || 'Unknown'), license: clean(meta.LicenseShortName?.value), licenseUrl: clean(meta.LicenseUrl?.value), description: clean(meta.ImageDescription?.value) }
}

async function searchCommons(scientificName, targetFilename) {
  const override = COMMONS_FILE_OVERRIDES.get(targetFilename) || COMMONS_OVERRIDES.get(scientificName)
  if (override) return getCommonsInfo(override)
  const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `\"${scientificName}\" filetype:bitmap`, gsrnamespace: '6', gsrlimit: '10', prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '1600', format: 'json', origin: '*' })
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`)
  const wanted = scientificName.toLowerCase()
  const candidates = Object.values(data.query?.pages || {}).map(page => ({ page, info: page.imageinfo?.[0] })).filter(item => item.info)
  const exact = candidates.find(({ page, info }) => `${page.title} ${clean(info.extmetadata?.ImageDescription?.value)} ${clean(info.extmetadata?.Categories?.value)}`.toLowerCase().includes(wanted))
  if (!exact) return null
  const fileName = exact.page.title.replace(/^File:/, '')
  return getCommonsInfo(fileName)
}

async function searchINaturalist(scientificName) {
  const taxonData = await getJson(`https://api.inaturalist.org/v1/taxa/autocomplete?${new URLSearchParams({ q: scientificName, per_page: '10' })}`)
  const taxon = taxonData.results?.find(item => item.name?.toLowerCase() === scientificName.toLowerCase())
  if (!taxon) return null
  const params = new URLSearchParams({ taxon_id: String(taxon.id), photos: 'true', quality_grade: 'research', photo_license: 'cc0,cc-by,cc-by-sa', order_by: 'votes', per_page: '30' })
  const observations = await getJson(`https://api.inaturalist.org/v1/observations?${params}`)
  for (const observation of observations.results || []) {
    const photo = observation.photos?.find(item => ['cc0', 'cc-by', 'cc-by-sa'].includes(String(item.license_code).toLowerCase()))
    if (!photo) continue
    return { sourcePage: observation.uri || `https://www.inaturalist.org/observations/${observation.id}`, downloadUrl: (photo.original_url || photo.url).replace('/square.', '/large.'), mime: 'image/jpeg', width: photo.original_dimensions?.width, height: photo.original_dimensions?.height, author: clean(photo.attribution || observation.user?.name || observation.user?.login), license: String(photo.license_code).toUpperCase(), licenseUrl: `https://creativecommons.org/licenses/${photo.license_code === 'cc0' ? 'zero/1.0' : photo.license_code.replace('cc-', '') + '/4.0'}/`, description: `${scientificName} research-grade observation on iNaturalist`, iNaturalistObservation: observation.id }
  }
  return null
}

async function download(url, target) {
  let response
  for (let attempt = 1; attempt <= 6; attempt++) {
    response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.ok) break
    if (attempt === 6) throw new Error(`Download failed: ${response.status}`)
    await sleep(1500 * attempt)
  }
  const temp = `${target}.download`
  await writeFile(temp, Buffer.from(await response.arrayBuffer()))
  await new Promise((done, reject) => {
    const child = spawn('/usr/bin/sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '1600', temp, '--out', target], { stdio: 'ignore' })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? done() : reject(new Error(`sips exited ${code}`)))
  })
  await unlink(temp)
}

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

await mkdir(realDir, { recursive: true })
const species = parseSpecies(await readFile(sourceFile, 'utf8'))
let previous = []
try { previous = JSON.parse(await readFile(manifestFile, 'utf8')) } catch {}
const byLocal = new Map(previous.map(item => [item.localFile || item.local, item]))
const review = []
let downloaded = 0
let preserved = 0

let nextIndex = 0
async function processNext() {
  while (nextIndex < species.length) {
  const index = nextIndex++
  const fish = species[index]
  const target = join(realDir, fish.filename)
  const localFile = `/assets/encyclopedia/real/${fish.filename}`
  const targetExists = await exists(target)
  const prior = byLocal.get(localFile)
  if (!overwrite && targetExists && !(refreshMetadata && prior?.status === 'existing-unverified')) {
    preserved++
    if (!byLocal.has(localFile)) {
      const generated = GENERATED_ART.get(fish.filename)
      byLocal.set(localFile, generated ? { ...generated, localFile, status: 'ai-scientific-illustration', createdAt: new Date().toISOString() } : { commonName: fish.commonName, scientificName: fish.scientificName, localFile, status: 'existing-unverified' })
    }
    continue
  }
  try {
    const taxon = await findTaxon(fish.scientificName)
    const commonsFile = taxon ? await getP18(taxon.id) : null
    const forcedCommons = COMMONS_FILE_OVERRIDES.has(fish.filename)
    const commonsImage = forcedCommons ? await searchCommons(fish.scientificName, fish.filename) : (commonsFile ? await getCommonsInfo(commonsFile) : await searchCommons(fish.scientificName, fish.filename))
    const image = commonsImage || await searchINaturalist(fish.scientificName)
    if (!image) throw new Error('Commons image metadata unavailable')
    if (!ALLOWED_LICENSE.test(image.license)) throw new Error(`License not accepted: ${image.license || 'missing'}`)
    if (!targetExists || overwrite || forcedCommons) await download(image.downloadUrl, target)
    byLocal.set(localFile, { commonName: fish.commonName, scientificName: fish.scientificName, wikidataEntity: taxon?.id || null, localFile, ...image, retrievedAt: new Date().toISOString(), status: commonsFile ? 'wikidata-p18-exact-taxon' : (commonsImage ? 'commons-exact-scientific-name' : 'inaturalist-research-grade-exact-taxon') })
    downloaded++
    process.stdout.write(`[${index + 1}/257] added ${fish.commonName}\n`)
  } catch (error) {
    review.push({ ...fish, reason: error.message })
    process.stdout.write(`[${index + 1}/257] REVIEW ${fish.commonName}: ${error.message}\n`)
  }
  await sleep(120)
  }
}

await Promise.all(Array.from({ length: 2 }, () => processNext()))

const manifest = [...byLocal.values()].sort((a, b) => (a.commonName || basename(a.localFile || a.local || '')).localeCompare(b.commonName || basename(b.localFile || b.local || '')))
await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
await writeFile(reviewFile, `${JSON.stringify(review, null, 2)}\n`)
console.log(JSON.stringify({ total: species.length, downloaded, preserved, review: review.length, manifest: manifest.length }, null, 2))
