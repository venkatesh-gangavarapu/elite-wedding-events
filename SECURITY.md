# Security Policy

## Principles

Security is part of the delivery lifecycle for the production website.

### Never commit
- Supabase service-role/secret keys
- Passwords
- API tokens
- Cloudflare API tokens
- Database credentials
- `.env` files
- Private certificates

Only browser-safe Supabase configuration belongs in client-side code.

### Authentication
The administration portal uses Supabase Authentication. Administrative access must not depend only on hiding the admin URL.

### Database
Supabase Row Level Security (RLS) should protect production tables and restrict administrative write operations to authorized users.

### Storage
Storage policies should be reviewed whenever the bucket or authentication model changes.

### Public repository checklist
Before every public push:
1. Review changed files.
2. Check for credentials and tokens.
3. Verify `.gitignore`.
4. Review configuration files.
5. Confirm no production secrets are present.

### If a secret is exposed
1. Revoke/rotate it immediately.
2. Identify affected systems.
3. Review relevant access history.
4. Replace the credential securely.
5. Review Git history if necessary.
6. Document the incident and prevention step.

## Reporting
Do not publish credentials or exploit details in a public issue. Report security concerns privately to the project owner.
