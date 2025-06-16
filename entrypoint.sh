#!/bin/sh

set -e

# Run seed script if DB is not initialized
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx ts-node src/seed/seed.ts
fi

echo "Starting backend server..."
npx ts-node src/app.ts