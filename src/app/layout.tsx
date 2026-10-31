import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Atelier — GenAI Event Orchestration & Planning Platform',
  description: 'AI-powered orchestrator for weddings, birthdays and celebrations — budgets, timelines, vendors, guest logistics, OpenStreetMap telemetry, and bespoke keepsake cards.',
  keywords: 'event planner, wedding planner, birthday planner, AI event orchestration, budget planner, vendor telemetry',
  openGraph: {
    title: 'Atelier — GenAI Event Orchestration Platform',
    description: 'Orchestrate your perfect event with AI: budgets, timelines, vendors, GIS telemetry, and personalized designs.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
