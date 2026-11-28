-- archivo: infra/db/01-roles.sql
-- Ejecutar como superusuario (postgres). Sin contraseñas: se asignan aparte.

-- Usuario que crea/modifica tablas (solo migraciones)
CREATE ROLE nomina_migrator LOGIN;

-- Usuario de la API: solo datos, NUNCA puede saltarse RLS
CREATE ROLE nomina_app LOGIN NOBYPASSRLS;

-- Base de datos, propiedad del migrador
CREATE DATABASE nomina OWNER nomina_migrator;

\connect nomina

-- Nadie entra por defecto al esquema público
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO nomina_migrator;
GRANT USAGE ON SCHEMA public TO nomina_app;

-- Las tablas que cree el migrador: la app solo puede leer/escribir datos
ALTER DEFAULT PRIVILEGES FOR ROLE nomina_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nomina_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nomina_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nomina_app;

psql -U postgres -h localhost -c "CREATE DATABASE nomina_shadow OWNER nomina_migrator;"

GRANT SELECT, INSERT, UPDATE ON TABLES TO nomina_app;
