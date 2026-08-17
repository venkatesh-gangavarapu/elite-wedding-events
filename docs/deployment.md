# Deployment Runbook

## Pre-deployment
1. Confirm working tree is clean.
2. Review changed files.
3. Confirm no secrets are included.
4. Validate the application.
5. Confirm production configuration.

## Git

```bash
git status
git add .
git commit -m "describe change"
git push origin main
```

## Post-deployment smoke test
1. Open the production domain.
2. Test hero slideshow.
3. Test portfolio navigation.
4. Test full-screen gallery.
5. Test WhatsApp/Instagram links.
6. Test `/admin/`.
7. Test owner authentication.
8. Test a small photo upload.
9. Verify the event appears publicly.

## DNS/HTTPS

```bash
nslookup eliteweddingevents.online
```

Verify HTTPS in the browser.

## Rollback
Identify the last known-good commit/deployment, revert the regression, deploy the correction, validate production and document the incident.
