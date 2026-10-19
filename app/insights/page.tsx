import type { Metadata } from 'next';
import Dashboard from '@/components/insights/Dashboard';
import './insights.css';

export const metadata: Metadata = { title: 'Insights', robots: { index: false, follow: false, nocache: true } };

/**
 * /insights is a ready-made page with no numbers in it: Cloudflare Access (an emailed code) lets only the owner
 * reach it, and the dashboard then loads its numbers from /api/insights/data, which checks the sign-in again
 * (lib/access.ts). Served as a plain file by worker.ts, so opening it costs no computer time.
 */
export default function InsightsPage() {
  return <Dashboard />;
}
