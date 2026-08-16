# Elite Wedding Events — Production Zero-Cost Build

> Local admin URL: `http://localhost:8000/admin/`
> The admin page requires Supabase `url` + public anon key in `config.js` before login can work.

**Domain:** `eliteweddingevents.online`  
**Business:** Elite Wedding Events, Nellore  
**Tagline:** We Decorate Your World  
**WhatsApp:** +91 96520 90534  
**Instagram:** @elite_wedding_events

## Architecture

- GitHub: source code + version control
- Cloudflare Pages: website hosting + custom domain
- Supabase Free: PostgreSQL + owner authentication + event photo storage
- No EC2/server required
- No paid API required

### Free-tier reality
The initial target is ₹0/month, subject to provider quotas. Supabase Free currently includes 500 MB database, 1 GB file storage, 5 GB egress and 50,000 MAU; it can pause inactive projects. See the official pricing page before scaling. A large photo portfolio can eventually exceed free storage/egress.

---

# PART A — Create Supabase

1. Open the official Supabase website and create a Free project.
2. Choose a strong database password and save it somewhere safe.
3. Go to **Authentication → Users**.
4. Create the owner's login email/password.
5. Copy the owner's **User UID**.
6. Go to **Storage → New bucket**.
7. Create a bucket named exactly:
   `event-photos`
8. Set the bucket to **Public**.
   - Public means visitors can load published event images.
   - Upload/delete are still protected by the SQL policies.
9. Open **SQL Editor**.
10. Paste all of `sql/setup.sql`.
11. Replace:
   `YOUR_OWNER_USER_UUID`
   with the owner's actual UID.
12. Run the final INSERT line:
   `insert into public.admins(user_id) values ('OWNER-UID');`

## Supabase values

Go to **Project Settings → API**.

You need:
- Project URL
- anon/public key

Put them into `config.js`:

```js
window.EWE_CONFIG = {
  url: "https://YOURPROJECT.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY"
};
```

**Never put the `service_role` key in the website.**

---

# PART B — Test locally

From the project root:

```bash
python -m http.server 8000
```

Open:

`http://localhost:8000`

Admin:

`http://localhost:8000/admin/`

Sign in with the Supabase owner account.

Create a test event and upload 2–3 photos.

Then refresh the public homepage. The event should appear automatically.

---

# PART C — Create GitHub repository

1. Create a new GitHub repository.
2. Recommended name:
   `elite-wedding-events`
3. Keep the repository public if using GitHub Free and you want the simplest public-code workflow.
4. Upload the project files.
5. Commit and push.

Example:

```bash
git init
git add .
git commit -m "Initial Elite Wedding Events website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/elite-wedding-events.git
git push -u origin main
```

---

# PART D — Deploy free with Cloudflare Pages

1. Create/sign in to a Cloudflare account.
2. Add `eliteweddingevents.online` as a zone.
3. Cloudflare will show two assigned nameservers.
4. In Namecheap, open the domain → **Nameservers**.
5. Choose **Custom DNS**.
6. Replace Namecheap's nameservers with the two Cloudflare nameservers.
7. Wait for Cloudflare to confirm the zone is active.
8. Review/import DNS records before changing nameservers.
9. In Cloudflare: **Workers & Pages → Create application → Pages → Connect to Git**.
10. Select the GitHub repository.
11. For this static build:
    - Build command: leave blank
    - Build output directory: `/`
12. Deploy.
13. Cloudflare gives you a `*.pages.dev` URL for testing.

---

# PART E — Connect `eliteweddingevents.online`

In Cloudflare:

1. Open **Workers & Pages**.
2. Open the Pages project.
3. Go to **Custom domains**.
4. Select **Set up a domain**.
5. Enter:
   `eliteweddingevents.online`
6. Follow Cloudflare's DNS activation steps.

Also add:
`www.eliteweddingevents.online`

Choose one canonical domain and redirect the other to it.

After DNS/SSL activation, test:

`https://eliteweddingevents.online`

and:

`https://eliteweddingevents.online/admin/`

Cloudflare will handle HTTPS for the Pages custom domain.

---

# PART F — Owner workflow

The owner does NOT need GitHub.

They only use:

`https://eliteweddingevents.online/admin/`

Workflow:

1. Login.
2. Add Event.
3. Select category.
4. Enter event name/location/date.
5. Select multiple photos.
6. Publish.
7. Event appears on the public website.

The owner can manage events without changing code.

---

# PART G — Future upgrades

Once the full photo collection is available:

- Add all categories.
- Add event descriptions.
- Add fullscreen gallery.
- Add event-specific URLs.
- Add enquiry form.
- Add genuine testimonials.
- Add Google Search Console.
- Add sitemap/robots.
- Add image compression before upload.
- Add backup/export process.
- Consider a dedicated image CDN/storage when the portfolio grows beyond Supabase Free limits.

## Security rules

- Never expose a Supabase service_role key.
- Use a strong unique admin password.
- Keep the owner account as the only row in `admins`.
- Do not disable RLS.
- Do not put customer/private information in public event descriptions.
- Test admin access in a private/incognito window before launch.
