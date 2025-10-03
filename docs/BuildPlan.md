# v1 / v1.1 Build Plan (Condensed)

## Objective
Build a conversion‑first site with easy editing and simple wins. v1 focuses on Shipping Calculator, Help‑Me‑Choose, Notary appointments, and Carrier pickup times. v1.1 adds Online Print Job Intake, Mailbox Reserve, Shredding Request, and Deals.

## Phase v1 (parity + high impact)
- Shipping Rate Calculator (rule-based; swap to live rates later)
- Help‑Me‑Choose wizard (feeds calculator)
- Notary appointments (Calendly/SavvyCal) + checklist
- Carrier Pickup Times (editable)
- Core pages: Home, Services, Shipping, Notary, About, Contact, FAQs
- Global: Header/Footer, CTAs, Reviews placeholder, Analytics events

## Phase v1.1 (enhancements)
- Printing online intake (Uppy + tusd + ClamAV + local folder OR MinIO)
- Mailbox reserve form
- Shredding request form
- Deals page and content expansion (FAQs, schema)

## Acceptance gate (v1)
- Calculator returns ranked options with correct DIM logic
- Wizard pre‑fills calculator and emails summary (optional)
- Notary booking embedded and tested with buffers
- Pickup times editable and reflected
- GA4 events fire and visible in debug view

## Acceptance gate (v1.1)
- Print intake accepts large files, creates job folders, and notifies staff
- Mailbox and Shredding flows live with confirmations
- Deals page live with at least one active promo
- Schema validated (LocalBusiness, Service, FAQPage)