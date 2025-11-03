import type { APIRoute } from 'astro';
import { getServices } from '../lib/directus';

const staticRoutes = ['/', '/services', '/shipping', '/notary', '/pickups', '/faqs', '/deals', '/editor-guide'];

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}`;
  const servicesRes = await getServices();
  const services = servicesRes?.data ?? [];

  const serviceUrls = services.map((service: any) => `/services/${service.slug}`);
  const allRoutes = [...staticRoutes, ...serviceUrls];
  const updated = new Date().toISOString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    allRoutes
      .map((path) => {
        const loc = `${base}${path}`;
        return `<url><loc>${loc}</loc><lastmod>${updated}</lastmod></url>`;
      })
      .join('') +
    `</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
