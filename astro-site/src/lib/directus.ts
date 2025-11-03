const BASE = import.meta.env.PUBLIC_DIRECTUS_URL;
const TOKEN = import.meta.env.DIRECTUS_STATIC_TOKEN;

export async function di(path: string, params: Record<string, any> = {}, init: RequestInit = {}) {
  if (!BASE) throw new Error('PUBLIC_DIRECTUS_URL is not configured');
  const url = new URL(path, BASE);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }
  if ([...searchParams.keys()].length) {
    url.search = searchParams.toString();
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  if (!res.ok) {
    throw new Error(`Directus ${res.status} ${res.statusText}`);
  }
  return res.json();
}

const SETTINGS_FIELDS = [
  'business_name',
  'address_lines',
  'city',
  'state',
  'zip',
  'phone',
  'email',
  'map_embed_url',
  'hours',
  'holiday_notes',
  'emergency_banner_enabled',
  'emergency_banner_text',
  'social_links',
  'hero_cta_links'
].join(',');

export async function getSettings() {
  const response = await di('/items/settings', { fields: SETTINGS_FIELDS, limit: 1 });
  const data = response?.data;
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  return data ?? null;
}

const SERVICE_FIELDS = [
  'id',
  'status',
  'sort',
  'name',
  'slug',
  'service_type',
  'summary',
  'hero_copy',
  'cta_label',
  'cta_url',
  'seo_title',
  'seo_description',
  'content_html',
  'checklist_items',
  'pricing_notes',
  'prohibited_items',
  'tracking_links'
].join(',');

export async function getServices(options: { limit?: number; offset?: number; filter?: Record<string, any>; fields?: string; includeDrafts?: boolean } = {}) {
  const { limit, offset, filter = {}, fields = SERVICE_FIELDS, includeDrafts = false } = options;
  const baseFilter: Record<string, any> = includeDrafts ? { } : { status: { _eq: 'published' } };
  const mergedFilter = { ...baseFilter, ...filter };
  const params: Record<string, any> = {
    fields,
    sort: 'sort',
    filter: JSON.stringify(mergedFilter)
  };
  if (typeof limit === 'number') params.limit = limit;
  if (typeof offset === 'number') params.offset = offset;
  return di('/items/services', params);
}

export async function getServiceBySlug(slug: string) {
  if (!slug) return null;
  const response = await getServices({ filter: { slug: { _eq: slug } }, limit: 1, includeDrafts: false });
  const data = response?.data;
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  return data ?? null;
}

export async function getPickupTimes(day?: string) {
  const baseFilter: Record<string, any> = { active: { _eq: true } };
  const filter = day ? { ...baseFilter, weekday: { _eq: day } } : baseFilter;
  return di('/items/pickup_times', {
    fields: 'id,carrier,service,weekday,cutoff_time,notes,active,sort',
    filter: JSON.stringify(filter),
    sort: 'carrier,sort,weekday'
  });
}

export async function getFaqs(options: { serviceId?: string; limit?: number; offset?: number } = {}) {
  const { serviceId, limit = 10, offset = 0 } = options;
  const filter: Record<string, any> = {};
  if (serviceId) {
    filter.service = { _eq: serviceId };
  }
  return di('/items/faqs', {
    fields: 'id,service,question,answer,sort',
    sort: 'sort,question',
    limit,
    offset,
    filter: Object.keys(filter).length ? JSON.stringify(filter) : undefined,
    meta: 'filter_count'
  });
}

export async function getDeals(options: { serviceId?: string; limit?: number; offset?: number; includeInactive?: boolean } = {}) {
  const { serviceId, limit = 12, offset = 0, includeInactive = false } = options;
  const filter: Record<string, any> = {};
  if (!includeInactive) {
    filter.active = { _eq: true };
  }
  if (serviceId) {
    filter.service = { _eq: serviceId };
  }
  return di('/items/deals', {
    fields: 'id,title,code,description,start_date,end_date,active,service',
    sort: '-active,-start_date,title',
    limit,
    offset,
    filter: Object.keys(filter).length ? JSON.stringify(filter) : undefined,
    meta: 'filter_count'
  });
}

export async function getDefaultCalcRules() {
  const response = await di('/items/calc_rules', {
    limit: 1,
    filter: JSON.stringify({ is_default: { _eq: true } }),
    fields: 'id,label,slug,description,is_default,rules'
  });
  const data = response?.data;
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  return data ?? null;
}
