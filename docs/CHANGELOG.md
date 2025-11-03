# Westside Shipping & More Website Updates

## Sprint v1 – Marketing Site Launch

### Directus CMS
- Added `settings` singleton collection with business identity, hours, hero CTAs, and emergency banner fields.
- Added `calc_rules` collection for configurable shipping calculator logic with default flag and editor guidance.
- Extended `services` collection with SEO, content, checklist, pricing, tracking, prohibited items, and booking embed fields.
- Linked FAQs and Deals to Services via Directus relations for contextual displays.

### Astro Frontend
- Implemented global layout with emergency banner, analytics data layer, header/footer, and structured data support.
- Built new pages: Home, Services hub, Service detail, Shipping (calculator + wizard), Notary, Pickup Times, FAQs, Deals, 404, Editor Guide.
- Added system endpoints for `robots.txt` and dynamic `sitemap.xml`.
- Introduced shipping calculator + help-me-choose wizard with placeholder rules from Directus, along with event instrumentation.
- Ensured consistent hours/contact information across pages via the `settings` singleton.

### Editor Notes
- Update business information, hours, banner, hero CTAs, and social links in Directus → **Settings**.
- Maintain pickup schedules in **pickup_times**; mark records as active for display.
- Manage service-specific FAQs and deals in their respective collections and link to the service.
- Shipping calculator weights live in **calc_rules** – adjust dimensional divisor, service types, and weights there.
