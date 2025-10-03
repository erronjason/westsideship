# Directus Setup

## Boot
- `docker compose up -d` then open http://localhost:8055
- Login with the ADMIN_EMAIL and ADMIN_PASSWORD

## Apply schema snapshot
```
curl -X POST "http://localhost:8055/schema/apply"   -H "Authorization: Bearer <ADMIN_TOKEN>"   -H "Content-Type: application/json"   --data @directus/schema-snapshot.json
```

## Create Static Token
- Settings → Access Tokens → New → copy token
- Put token in `astro-site/.env` as `DIRECTUS_STATIC_TOKEN`

## Seed content
- Create Services (Shipping, Printing, Mailboxes, Notary, Shredding, Packing, Binding, Bounce Luggage)
- Enter pickup times by carrier / weekday
- Add FAQs and a sample Deal