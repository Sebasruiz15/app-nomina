-- This is an empty migration.REVOKE DELETE, TRUNCATE ON "empresas", "sedes" FROM nomina_app;

ALTER DEFAULT PRIVILEGES FOR ROLE nomina_migrator IN SCHEMA public
  REVOKE DELETE, TRUNCATE ON TABLES FROM nomina_app;