/**
 * Send a custom event to Umami (a no-op when the tracker isn't loaded:
 * local dev, /insights, Do Not Track, or before the keys are set).
 * Names carry their detail ("Filter · Photography › Portraits") so each
 * shows up as its own row in the dashboard without extra setup.
 */
type Umami = { track: (name: string, data?: Record<string, string | number>) => void };

export function track(name: string, data?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { umami?: Umami }).umami?.track(name, data);
}
