const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fishcareai.com'

export default function NotFound() {
  return (
    <div className="con" style={{ padding: '80px 22px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Species Not Found</h1>
      <p style={{ marginBottom: '24px' }}>
        This species profile is not yet available. Browse the full encyclopedia below.
      </p>
      <a
        href={`${SITE_URL}/wiki/`}
        style={{
          display: 'inline-block',
          background: 'var(--p)',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Browse Fish Encyclopedia
      </a>
    </div>
  )
}
