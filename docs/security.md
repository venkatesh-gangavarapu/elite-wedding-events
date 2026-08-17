# Production Security Controls

## Application
- Owner authentication through Supabase Auth.
- Admin access is protected by authentication and database policies.
- Production data access is controlled by Supabase policies.

## Credentials
Never expose:
- service-role keys
- secret keys
- database passwords
- Cloudflare API tokens

## Change Management

```text
Change → Local validation → Git commit → Push → Deployment → Smoke test
```
