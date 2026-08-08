const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="con">
        <div className="ftg">
          <div className="ftbr">
            <div className="logo">FishCare AI</div>
            <p>Practical aquarium care guides, fish encyclopedia, and free tools for freshwater and saltwater fish keepers.</p>
          </div>
          <div className="ftcol">
            <h5>Guides</h5>
            <a href={`${SITE_URL}/guides/`}>All Guides</a>
            <a href={`${SITE_URL}/guides/betta-fish-care/`}>Betta Fish</a>
            <a href={`${SITE_URL}/guides/angelfish-care/`}>Angelfish</a>
            <a href={`${SITE_URL}/guides/discus-fish-care-requirements/`}>Discus</a>
          </div>
          <div className="ftcol">
            <h5>Encyclopedia</h5>
            <a href={`${SITE_URL}/species/`}>All Species</a>
            <a href={`${SITE_URL}/species/paracheirodon-innesi`}>Neon Tetra</a>
            <a href={`${SITE_URL}/species/corydoras-aeneus`}>Corydoras</a>
            <a href={`${SITE_URL}/species/poecilia-reticulata`}>Guppy</a>
          </div>
          <div className="ftcol">
            <h5>Tools</h5>
            <a href={`${SITE_URL}/tools/fish-compatibility-checker/`}>Compatibility Checker</a>
            <a href={`${SITE_URL}/tools/tank-size-calculator/`}>Tank Size Calculator</a>
            <a href={`${SITE_URL}/tools/water-parameter-checker/`}>Water Parameters</a>
          </div>
        </div>
        <div className="ftb">
          © {new Date().getFullYear()} FishCare AI. Practical freshwater and saltwater fish care guides and tools.
        </div>
        <nav className="legal-links" aria-label="Legal and company information">
          <a href={`${SITE_URL}/about/`}>About</a>
          <a href={`${SITE_URL}/contact/`}>Contact</a>
          <a href={`${SITE_URL}/editorial-policy/`}>Editorial Policy</a>
          <a href={`${SITE_URL}/privacy/`}>Privacy</a>
          <a href={`${SITE_URL}/image-credits/`}>Image Credits</a>
        </nav>
      </div>
    </footer>
  )
}
