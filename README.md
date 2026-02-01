# Pixly - Marketing Attribution Platform

A modern, premium SaaS platform for tracking and attributing marketing conversions across all ad channels. Built with Next.js 14, TypeScript, Firebase, and Tailwind CSS.

## Features

- **Multi-Platform Tracking**: Meta, Google Ads, TikTok, and more
- **Real-Time Attribution**: Server-side tracking that bypasses ad blockers
- **Multiple Attribution Models**: Last-click, first-click, linear, time-decay, position-based
- **Conversion Sync**: Send conversions back to Meta CAPI and Google Ads
- **Beautiful Dashboard**: Premium UI with real-time metrics and charts
- **Easy Integration**: Simple pixel installation in minutes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Firebase Cloud Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **State Management**: Zustand, React Query

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Meta Developer account (for Meta Ads integration)
- Google Cloud project (for Google Ads integration)
- Stripe account (for payment processing)

### Installation

1. Clone and install dependencies:

```bash
cd "Clone Cometly"
npm install
```

2. Copy the environment file and configure:

```bash
cp .env.example .env.local
```

3. Configure your `.env.local` with:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Meta
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
NEXT_PUBLIC_META_APP_ID=your_meta_app_id

# Google Ads
GOOGLE_ADS_CLIENT_ID=your_google_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   │   ├── track/         # Pixel tracking endpoint
│   │   ├── oauth/         # OAuth callbacks
│   │   └── webhooks/      # Stripe webhooks
│   └── onboarding/        # Onboarding flow
├── components/
│   ├── ui/                # Base UI components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── firebase/          # Firebase configuration
│   ├── tracking/          # Pixel processing
│   ├── attribution/       # Attribution engine
│   └── integrations/      # Meta CAPI, Google Ads
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## Pixel Installation

Add this code to your website's `<head>`:

```html
<script src="https://your-domain.com/pixel.js" data-pixel-id="TRK_xxxxx" async></script>
```

### Track Events

```javascript
// Track page view (automatic)

// Identify user
Pixly.identify('user@email.com');

// Track lead
Pixly.lead({ email: 'user@email.com' });

// Track purchase
Pixly.purchase(99.99, 'USD', { orderId: '12345' });

// Custom event
Pixly.track('button_click', { buttonId: 'cta-main' });
```

## Firebase Setup

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Workspace access
    match /workspaces/{workspaceId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.memberIds;
    }

    // Events - write from pixel, read from dashboard
    match /events/{eventId} {
      allow write: if true; // Pixel writes
      allow read: if request.auth != null;
    }

    // Conversions
    match /conversions/{conversionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## API Reference

### POST /api/track

Receives tracking events from the pixel.

**Request Body:**
```json
{
  "pixelId": "TRK_xxxxx",
  "event": "purchase",
  "properties": { "value": 99.99, "currency": "USD" },
  "fpid": "uuid",
  "sessionId": "uuid",
  "clickIds": { "gclid": "xxx", "fbclid": "xxx" },
  "timestamp": 1234567890
}
```

### Stripe Webhook

Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

Events handled:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `charge.refunded`

## License

MIT

## Support

For support, email support@pixly.app or open an issue.
