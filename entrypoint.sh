#!/bin/sh

# Apply the database schema on remote
prisma db push --skip-generate

exec "$@"