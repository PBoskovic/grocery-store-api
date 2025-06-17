#!/bin/sh

set -e

# Run seed script if DB is not initialized
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx ts-node src/seed/seed.ts
fi

if [ "$NODE_ENV" = "development" ]; then
  echo "Starting backend in DEV mode (hot reload)..."
  npm run dev
else
  echo "Building TypeScript for production..."
  npm run build
  echo "Starting backend in PRODUCTION mode..."
  npm run start
fi