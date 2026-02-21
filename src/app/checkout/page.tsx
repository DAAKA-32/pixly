import { Metadata } from 'next';
import CheckoutClient from './checkout-client';

// ===========================================
// PIXLY - Checkout Page (Server)
// Private: noindex to prevent crawling
// ===========================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
