import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pixly — Plateforme d\'attribution marketing multi-touch';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%, #ecfdf5 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.06)',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              P
            </span>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#171717',
              letterSpacing: '-0.02em',
            }}
          >
            Pixly
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#171717',
            textAlign: 'center',
            lineHeight: 1.15,
            margin: 0,
            maxWidth: 900,
            letterSpacing: '-0.02em',
          }}
        >
          Attribution Marketing Multi-Touch
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 24,
            color: '#737373',
            textAlign: 'center',
            margin: '20px 0 0',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Mesurez votre vrai ROAS. Tracking server-side, analytics avancés et intégrations multi-plateformes.
        </p>

        {/* Bottom badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 40,
            padding: '10px 24px',
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#059669',
            }}
          >
            pixly.app
          </span>
          <span
            style={{
              fontSize: 16,
              color: '#a3a3a3',
            }}
          >
            — Essai gratuit 14 jours
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
