# Architecture

## Components

### Cloudflare
Public DNS, HTTPS and the configured web deployment/edge layer.

### Public Application
Premium responsive portfolio, hero slideshow, event categories, gallery and customer contact paths.

### Admin Portal
Owner authentication and portfolio/event management.

### Supabase
- Authentication
- PostgreSQL database
- Event metadata
- Photo metadata
- Object storage

## Data Flow

```text
Customer → Cloudflare → Public Website
                           |
                           +→ Supabase data
                           +→ Supabase Storage

Owner → Admin Portal → Supabase Auth
                    → Event metadata
                    → Optimized image upload
```

## Design Decisions

### Serverless/free-tier approach
The business is primarily a portfolio site with variable traffic. An always-on VM would add unnecessary cost and operational overhead.

### Supabase
Authentication, relational data and object storage are provided through one platform.

### Cloudflare
Provides the public domain/DNS/HTTPS layer without requiring an always-on application server.

### Client-side image optimization
Large wedding photographs are converted to high-quality WebP in the owner's browser, reducing storage and bandwidth without a paid image-processing API.
