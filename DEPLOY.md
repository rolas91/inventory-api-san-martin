# Despliegue en CapRover

## 1. Crear la base de datos PostgreSQL

En el panel de CapRover → **One-Click Apps** → busca **PostgreSQL** e instálala.

| Campo             | Valor sugerido        |
|-------------------|-----------------------|
| App Name          | `inventory-db`        |
| PostgreSQL User   | `inventory_user`      |
| PostgreSQL Password | `<contraseña segura>` |
| PostgreSQL DB     | `inventory_db`        |

CapRover expone la DB internamente en: `srv-captain--inventory-db:5432`

---

## 2. Crear la app NestJS

En CapRover → **Apps** → **Create New App**:

- Nombre: `inventory-api`
- Marcar **Has Persistent Data**: NO (la DB es separada)

---

## 3. Configurar variables de entorno

En la app `inventory-api` → pestaña **App Configs** → **Environmental Variables**:

```
NODE_ENV=production
PORT=3000

DB_HOST=srv-captain--inventory-db
DB_PORT=5432
DB_USER=inventory_user
DB_PASSWORD=<contraseña que pusiste en paso 1>
DB_NAME=inventory_db

JWT_SECRET=<genera uno con: openssl rand -hex 32>
JWT_EXPIRES_IN=7d

GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 4. Desplegar con caprover CLI

```bash
# Instalar CLI (una sola vez)
npm install -g caprover

# Login
caprover login

# Desde la carpeta inventory-api
caprover deploy --appName inventory-api
```

El CLI empaqueta el proyecto, sube el `captain-definition`, y CapRover construye la imagen con el `Dockerfile`.

---

## 5. Qué pasa al arrancar

El `docker-entrypoint.sh` hace automáticamente:

1. **Espera** a que PostgreSQL esté disponible (reintentos cada 2s)
2. **Ejecuta** `migration:run` → crea todas las tablas
3. **Inicia** `node dist/main`

Para correr el seed inicial (datos de prueba), entra a la consola del contenedor en CapRover:

```bash
node -r dotenv/config ./node_modules/.bin/ts-node \
  src/database/seeds/seed.ts
```

O conéctate directamente a la DB desde tu máquina con las credenciales y corre `npm run seed` apuntando al host externo.

---

## Estructura de archivos de despliegue

```
inventory-api/
├── captain-definition      ← le dice a CapRover que use el Dockerfile
├── Dockerfile              ← build multistage (builder + runner)
├── docker-entrypoint.sh   ← espera DB, corre migraciones, inicia app
└── .dockerignore           ← excluye node_modules, .env, tests, etc.
```
