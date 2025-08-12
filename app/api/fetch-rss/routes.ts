// app/api/fetch-rss/route.ts
import { NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'pib.gov.in',
  'thehindu.com',
  'thewire.in',
  'scroll.in',
  'factly.in'
];

export async function GET(request: Request) {
  try {
    const urlParam = new URL(request.url).searchParams.get('url');
    if (!urlParam) {
      return NextResponse.json({ error: "Missing 'url' query param" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlParam);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // basic allowlist check to avoid turning your endpoint into an open proxy
    const hostname = parsedUrl.hostname;
    if (!ALLOWED_HOSTS.some(h => hostname.includes(h))) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    const rssRes = await fetch(parsedUrl.toString(), {
      // Use a browser-like UA — some feeds block non-browser UAs
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Political-Truth-Tracker/1.0)' },
      // you can set a timeout via AbortController if you want (optional)
    });

    if (!rssRes.ok) {
      return NextResponse.json({ error: `Upstream HTTP ${rssRes.status}` }, { status: rssRes.status });
    }

    const xml = await rssRes.text();
    return new NextResponse(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  } catch (err: any) {
    console.error('fetch-rss error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
