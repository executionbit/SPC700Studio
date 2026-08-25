#!/usr/bin/env bash
set -euo pipefail

# Keep merged task environments reproducible without prompting for input.
npm ci --ignore-scripts
npm test