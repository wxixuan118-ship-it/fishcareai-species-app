const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="con">
        <div className="ftg">
          <div className="ftbr">
            <div className="logo">FishCare AI</div>
            <p>Practical aquarium care guides, fish encyclopedia, and free tools for freshwater and saltwater fishkeepers.</p>
          </div>

          <div className="ftcol">
            <h5>Explore</h5>
            <a href={`${SITE_URL}/species/`}>Fish Species</a>
            <a href={`${SITE_URL}/aquarium-fish-diseases/`}>Fish Diseases</a>
            <a href={`${SITE_URL}/guides/`}>Guides</a>
            <a href={`${SITE_URL}/tools/`}>Aquarium Tools</a>
            <a href="https://identify.fishcareai.com/">Fish Identify</a>
          </div>

          <div className="ftcol">
            <h5>Popular Tools</h5>
            <a href={`${SITE_URL}/tools/fish-compatibility-checker/`}>Compatibility Checker</a>
            <a href={`${SITE_URL}/tools/tank-size-calculator/`}>Tank Size Calculator</a>
            <a href={`${SITE_URL}/tools/water-parameter-checker/`}>Water Parameters</a>
            <a href={`${SITE_URL}/tools/fish-feeding-calculator/`}>Feeding Calculator</a>
            <a href={`${SITE_URL}/tools/aquarium-planner/`}>Aquarium Planner</a>
          </div>

          <div className="ftcol">
            <h5>Company</h5>
            <a href={`${SITE_URL}/about/`}>About</a>
            <a href={`${SITE_URL}/contact/`}>Contact</a>
            <a href={`${SITE_URL}/privacy/`}>Privacy Policy</a>
            <a href={`${SITE_URL}/terms/`}>Terms</a>
            <a href={`${SITE_URL}/editorial-policy/`}>Editorial Policy</a>
          </div>
        </div>

        <div className="ftb">
          © {new Date().getFullYear()} EverTrend LLC. FishCare AI is a product of EverTrend LLC. All rights reserved.
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
