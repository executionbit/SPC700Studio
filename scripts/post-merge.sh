#!/usr/bin/env bash
set -euo pipefail

# Keep merged task environments reproducible without prompting for input.
npm ci --ignore-scripts
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/schema.sql
npm test