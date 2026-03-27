#!/bin/sh
set -e

echo "⏳ Esperando a que PostgreSQL esté listo..."
until node -e "
  const { Client } = require('pg');
  const c = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  PostgreSQL no disponible, reintentando en 2s..."
  sleep 2
done

echo "✅ PostgreSQL listo"

echo "🔄 Ejecutando migraciones..."
node -r tsconfig-paths/register -r dotenv/config \
  ./node_modules/typeorm/cli.js \
  migration:run \
  --dataSource dist/database/data-source.js

echo "🚀 Iniciando API..."
exec node dist/main
