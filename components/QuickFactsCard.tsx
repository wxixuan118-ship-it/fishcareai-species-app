import type { Species } from '@/types/species'

interface Props {
  species: Species
}

const DIFFICULTY_CLASS: Record<string, string> = {
  beginner: 'bgood',
  intermediate: 'bwarn',
  advanced: 'bdng',
}

export default function QuickFactsCard({ species }: Props) {
  const diffClass = species.difficulty_level ? DIFFICULTY_CLASS[species.difficulty_level] : 'bgood'
  const diffLabel = species.difficulty_level
    ? species.difficulty_level.charAt(0).toUpperCase() + species.difficulty_level.slice(1)
    : '—'

  return (
    <div className="qf-card">
      <div className="qf-head">Quick Facts</div>
      <table className="qf-table">
        <tbody>
          <tr>
            <td>Scientific name</td>
            <td><em>{species.scientific_name}</em></td>
          </tr>
          <tr>
            <td>Common name</td>
            <td>{species.common_name}</td>
          </tr>
          {species.family && (
            <tr>
              <td>Family</td>
              <td>{species.family}</td>
            </tr>
          )}
          {species.genus && (
            <tr>
              <td>Genus</td>
              <td><em>{species.genus}</em></td>
            </tr>
          )}
          {species.origin && (
            <tr>
              <td>Origin</td>
              <td>{species.origin}</td>
            </tr>
          )}
          {species.physical?.size_cm && (
            <tr>
              <td>Adult size</td>
              <td>{species.physical.size_cm}</td>
            </tr>
          )}
          {species.physical?.lifespan_years && (
            <tr>
              <td>Lifespan</td>
              <td>{species.physical.lifespan_years}</td>
            </tr>
          )}
          {species.water_type && (
            <tr>
              <td>Water type</td>
              <td style={{ textTransform: 'capitalize' }}>{species.water_type}</td>
            </tr>
          )}
          {species.environment?.temp_min_c != null && (
            <tr>
              <td>Temperature</td>
              <td>{species.environment.temp_min_c}–{species.environment.temp_max_c}°C</td>
            </tr>
          )}
          {species.environment?.ph_min != null && (
            <tr>
              <td>pH range</td>
              <td>{species.environment.ph_min}–{species.environment.ph_max}</td>
            </tr>
          )}
          {species.environment?.min_tank_liters != null && (
            <tr>
              <td>Min. tank size</td>
              <td>{species.environment.min_tank_liters}L ({Math.round(species.environment.min_tank_liters * 0.264)} gal)</td>
            </tr>
          )}
          {species.behavior?.temperament && (
            <tr>
              <td>Temperament</td>
              <td>{species.behavior.temperament}</td>
            </tr>
          )}
          <tr>
            <td>Care level</td>
            <td><span className={`bdg ${diffClass}`}>{diffLabel}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
