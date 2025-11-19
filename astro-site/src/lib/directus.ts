const BASE = import.meta.env.PUBLIC_DIRECTUS_URL;
const TOKEN = import.meta.env.DIRECTUS_STATIC_TOKEN;
let warnedAboutMissingBase = false;

function emptyResponse() {
  if (!warnedAboutMissingBase) {
    console.warn('PUBLIC_DIRECTUS_URL is not set. Returning empty data for build-time rendering.');
    warnedAboutMissingBase = true;
  }
  return { data: [] };
}

export async function di(path, params = {}) {
  if (!BASE) return emptyResponse();
  const url = new URL(path, BASE);
  if (params && Object.keys(params).length) {
    url.search = new URLSearchParams(params).toString();
  }
  const headers = { 'Accept': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Directus ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getServices() {
  return di('/items/services', { fields: 'id,name,slug,service_type,summary,cta_label,cta_url,status', filter: JSON.stringify({ status: { _eq: 'published' } }), sort: 'sort' });
}

export async function getPickupTimes(day) {
  const baseFilter = { active: { _eq: true } };
  const filter = day ? { ...baseFilter, weekday: { _eq: day } } : baseFilter;
  return di('/items/pickup_times', { fields: 'carrier,service,weekday,cutoff_time,notes,active', filter: JSON.stringify(filter), sort: 'sort' });
}

export async function getFaqs(serviceId) {
  const params = { fields: 'service,question,answer,sort', sort: 'sort' };
  if (serviceId) params.filter = JSON.stringify({ service: { _eq: serviceId } });
  return di('/items/faqs', params);
}

export async function getDeals() {
  return di('/items/deals', { fields: 'title,code,description,start_date,end_date,active,service', filter: JSON.stringify({ active: { _eq: true } }) });
}
