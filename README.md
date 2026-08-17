# Elite Wedding Events — Production DevOps Portfolio

> Production-style event portfolio platform built, deployed, secured and optimized for a real business in Nellore, Andhra Pradesh.

🌐 **Live:** https://eliteweddingevents.online/

## Overview

The platform provides a premium customer-facing portfolio and an owner administration portal for managing event galleries.

### DevOps focus
- Git/GitHub source control
- Cloudflare DNS, HTTPS and deployment
- Supabase Auth, PostgreSQL and Storage
- Owner-only administration
- Client-side high-quality WebP image optimization
- SEO foundation: sitemap, robots.txt and LocalBusiness structured data
- Zero-monthly-hosting-cost target within applicable free tiers
- Production troubleshooting and operational documentation

## Architecture

```text
Customer
   |
   v
eliteweddingevents.online
   |
   v
Cloudflare (DNS + HTTPS)
   |
   v
Public Web App
   |
   +------> Supabase PostgreSQL / Storage
   |
   +------> WhatsApp / Instagram

Owner
   |
   v
Admin Portal
   |
   +------> Supabase Auth
   +------> Event metadata
   +------> Optimized photo upload
```

See [architecture/architecture.md](architecture/architecture.md).

## Production Workflow

```text
Requirement → Development → Git Commit → GitHub
                                      ↓
                                 Deployment
                                      ↓
                                  Production
                                      ↓
                             Validation / Ops
                                      ↓
                               Optimization
```

## Repository Structure

```text
elite-wedding-events/
├── admin/
├── assets/
├── architecture/
├── docs/
├── sql/
├── .github/workflows/
├── app.js
├── styles.css
├── config.js
├── robots.txt
├── sitemap.xml
├── SECURITY.md
└── README.md
```

## Security

- Supabase Authentication for owner access
- Database Row Level Security
- No service-role key in browser code
- Local secrets excluded through `.gitignore`
- Public repository security policy

See [SECURITY.md](SECURITY.md).

## Performance

New portfolio uploads are optimized in the owner's browser:

```text
Original → max 2400px long edge → high-quality WebP → Supabase Storage
```

This reduces storage and bandwidth while keeping a high-quality gallery image.

## SEO

- Canonical URL
- `robots.txt`
- `sitemap.xml`
- LocalBusiness structured data
- Open Graph metadata
- Nellore-focused service content

## Cost Optimization

The architecture avoids an always-on VM/database server and targets ₹0/month infrastructure cost while usage remains within the selected providers' free tiers.

## Interview Value

This project demonstrates:

**Business requirement → Architecture → Development → Deployment → Security → Performance → SEO → Operations**

Only technologies actually used in the project are documented; future tools are listed separately as roadmap items.
