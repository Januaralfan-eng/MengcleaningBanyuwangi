# Meng-Cleaning Banyuwangi

Deployment source for the public Meng-Cleaning Banyuwangi website.

This repo keeps the active UI/UX unchanged by snapshotting the current live frontend during build, then serving the missing public API routes from Vercel Functions:

- `/api/site-settings`
- `/api/public-content`
- `/api/public-bookings`
- `/api/trpc/*`

Persistent admin/customer data is read from Vercel Blob through `BLOB_READ_WRITE_TOKEN`.
