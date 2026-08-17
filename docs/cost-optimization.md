# Cost Optimization

## Target
Operate the portfolio at approximately ₹0/month while usage remains within provider free-tier limits.

## Controls
- Cloudflare DNS/HTTPS
- Supabase free tier
- Client-side WebP optimization
- No always-on VM
- No dedicated database server
- No paid image-processing API

## Growth risk
Photography storage and bandwidth are the first resources to monitor.

```text
More photos → optimized WebP → lower storage/bandwidth → longer free-tier runway
```

Free-tier limits can change and should be reviewed periodically.
