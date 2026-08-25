---
name: Stripe connector fields
description: Current Replit Stripe connector credential field names used by this project.
---

When constructing a Stripe server client from the Replit connector response, prefer the current `secret` field and use `publishable` only for the browser-safe key. Keep compatibility fallbacks for older field names.

**Why:** Connector payload names can differ from older integration templates. Assuming `secret_key` prevented the app from starting even though Stripe was attached and healthy.

**How to apply:** Treat missing credentials as a configuration error, but support the known current and legacy field labels without logging values. Use the managed Stripe sync to validate webhook payloads before parsing their event JSON.