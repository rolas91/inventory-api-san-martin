#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones..."
node ./node_modules/typeorm/cli.js migration:run --dataSource dist/database/data-source.js

echo "🚀 Iniciando API..."
exec node dist/main
