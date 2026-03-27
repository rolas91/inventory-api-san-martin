# Inventory API — NestJS + PostgreSQL

Backend del sistema de inventario físico San Martín.

## Tecnologías
- **NestJS** (framework)
- **TypeORM** (ORM)
- **PostgreSQL** (base de datos)
- **JWT** (autenticación)
- **Swagger** (documentación API)
- **class-validator** (validaciones)

## Arquitectura (Clean Architecture)

```
src/
├── common/              # Filtros, guards, decoradores globales
├── config/              # Configuración de BD y JWT
└── modules/
    ├── auth/            # Autenticación (login/register)
    │   ├── domain/      # Entidades + interfaces
    │   ├── application/ # Use cases + DTOs
    │   └── infrastructure/ # Controller + Repository + Strategy
    ├── planta/          # Productos de planta
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    └── inv-fisico/      # Inventario físico
        ├── domain/
        ├── application/
        └── infrastructure/
```

## Configuración

1. **Copia el archivo de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Crea la base de datos PostgreSQL:**
   ```sql
   CREATE DATABASE inventory_db;
   ```

3. **Configura las variables en `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=inventory_db
   JWT_SECRET=tu_secreto_seguro
   JWT_EXPIRES_IN=7d
   ```

4. **Instala dependencias:**
   ```bash
   npm install
   ```

5. **Inicia el servidor:**
   ```bash
   npm run start:dev
   ```

Las tablas se crean automáticamente con `synchronize: true` en modo desarrollo.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/Auth/login` | ❌ | Login |
| `POST` | `/api/Auth/register` | ❌ | Registro |
| `GET` | `/api/Planta` | ✅ JWT | Todos los productos |
| `GET` | `/api/Planta/all-producto-kilos` | ✅ JWT | Productos kilos |
| `POST` | `/api/Planta` | ✅ JWT | Crear producto |
| `POST` | `/api/Planta/kilos` | ✅ JWT | Crear producto kilos |
| `POST` | `/api/InvFisico/batch` | ✅ JWT | Enviar inventario |
| `DELETE` | `/api/InvFisico/delete-all` | ✅ JWT | Limpiar inventario |

## Documentación Swagger

```
http://localhost:3000/docs
```

## Configurar en la app móvil

En `src/core/config/apiUrl.ts` del proyecto RN, actualiza:
```ts
const DEFAULT_URLS = {
  prod: 'http://TU_IP_SERVIDOR/api',
  android: 'http://10.0.2.2:3000/api',  // emulador
  // android: 'http://TU_IP_LOCAL:3000/api', // dispositivo físico
};
```
