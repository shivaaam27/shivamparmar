/**
 * Device, browser and system from a user-agent string, named the way Umami
 * names them so both sources read the same on the dashboard.
 */
export function parseUA(ua: string) {
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'tablet' : /Mobi|iPhone|iPod|Android/i.test(ua) ? 'mobile' : 'desktop';
  const ios = /iPhone|iPad|iPod/.test(ua);
  const browser =
    /Edg\//.test(ua) ? 'edge-chromium'
    : /SamsungBrowser/.test(ua) ? 'samsung'
    : /OPR\/|Opera/.test(ua) ? 'opera'
    : /FxiOS/.test(ua) ? 'fxios'
    : /Firefox\//.test(ua) ? 'firefox'
    : /CriOS/.test(ua) ? 'crios'
    : /Instagram/.test(ua) ? 'instagram'
    : /FBAN|FBAV/.test(ua) ? 'facebook'
    : /Chrome\//.test(ua) ? 'chrome'
    : ios ? 'ios'
    : /Safari\//.test(ua) ? 'safari'
    : 'other';
  const os =
    /Windows NT 10/.test(ua) ? 'Windows 10'
    : /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android OS'
    : ios ? 'iOS'
    : /CrOS/.test(ua) ? 'Chrome OS'
    : /Mac OS X/.test(ua) ? 'Mac OS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Other';
  return { device, browser, os };
}

/** Crawlers, previews, headless browsers and uptime checkers. */
export const isBot = (ua: string) =>
  !ua || /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|facebookexternalhit|embedly|quora|whatsapp|telegram/i.test(ua);
