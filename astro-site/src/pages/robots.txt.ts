import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
