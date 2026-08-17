# Performance

## Image optimization

```text
Original
   ↓
Resize to maximum 2400px long edge
   ↓
High-quality WebP
   ↓
Supabase Storage
```

This reduces bandwidth/storage while retaining a high-quality web image.

## Hero
Hero photographs are preloaded to reduce visual flicker during the slideshow.

## Future improvements
- Responsive `srcset` variants
- AVIF where beneficial
- Lighthouse CI
- Core Web Vitals monitoring
- Automated asset-size checks
