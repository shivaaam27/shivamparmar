import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { MIN_SECRET, authConfigured, currentUser, secretStrong, usesAccess } from '@/lib/auth';
import { toRange } from '@/lib/insights-shared';
import { toSource } from '@/lib/insights-data';
import Dashboard from '@/components/insights/Dashboard';
import './insights.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Insights', robots: { index: false, follow: false, nocache: true } };

type Props = { searchParams: Promise<{ range?: string; source?: string }> };

/**
 * /insights: only checks who you are, then hands over to the dashboard, which loads its numbers and
 * draws itself in the browser (components/insights/Dashboard.tsx). Kept this small on purpose: the
 * server does almost no work, so the page fits Cloudflare's free plan.
 */
export default async function InsightsPage({ searchParams }: Props) {
  if (!authConfigured()) notFound();
  const user = await currentUser();
  if (!user) return <SignIn />;
  const params = await searchParams;
  return (
    <Dashboard
      range={toRange(params.range)}
      source={toSource(params.source) ?? null}
      user={user}
      signOut={usesAccess() ? '/cdn-cgi/access/logout' : '/api/auth/signout'}
    />
  );
}

function SignIn() {
  return (
    <main id="main" className="dash dash--signin">
      <div className="card signin">
        <p className="dash__eyebrow">Private</p>
        <h1 className="dash__title">Insights</h1>
        {usesAccess() ? (
          <p className="signin__text">This page opens only after the email code sign-in. Reload it to sign in again.</p>
        ) : secretStrong() ? (
          <>
            <p className="signin__text">Sign in with the GitHub account that owns this site.</p>
            <a className="signin__btn" href="/api/auth/github">Sign in with GitHub<ArrowUpRight size={16} aria-hidden="true" /></a>
          </>
        ) : (
          <p className="dash__note" role="alert">
            Sign-in is paused: AUTH_SECRET in Cloudflare is too short to keep this page private. Set it to a random value of at
            least {MIN_SECRET} characters and redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
