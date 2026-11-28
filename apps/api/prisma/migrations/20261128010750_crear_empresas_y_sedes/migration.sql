-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL,
    "nit" VARCHAR(15) NOT NULL,
    "digito_verificacion" CHAR(1) NOT NULL,
    "razon_social" VARCHAR(200) NOT NULL,
    "nombre_comercial" VARCHAR(200),
    "arl_codigo" VARCHAR(10),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "municipio_codigo" CHAR(5) NOT NULL,
    "caja_compensacion_codigo" VARCHAR(10),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nit_key" ON "empresas"("nit");

-- CreateIndex
CREATE INDEX "sedes_empresa_id_idx" ON "sedes"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_empresa_id_nombre_key" ON "sedes"("empresa_id", "nombre");

-- AddForeignKey
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- archivo: apps/api/prisma/migrations/20261128010750_crear_empresas_y_sedes/migration.sql

-- ===== Validaciones de datos =====
ALTER TABLE "empresas"
  ADD CONSTRAINT "empresas_nit_formato_chk" CHECK ("nit" ~ '^[0-9]{5,15}$'),
  ADD CONSTRAINT "empresas_dv_formato_chk"  CHECK ("digito_verificacion" ~ '^[0-9]$');

ALTER TABLE "sedes"
  ADD CONSTRAINT "sedes_municipio_formato_chk" CHECK ("municipio_codigo" ~ '^[0-9]{5}$');

-- ===== Row Level Security =====
-- FORCE hace que RLS aplique incluso al dueño de la tabla.
ALTER TABLE "empresas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "empresas" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sedes"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sedes"    FORCE ROW LEVEL SECURITY;

-- current_setting(..., true) devuelve NULL si no está definida -> no ve nada.
CREATE POLICY "empresas_aislamiento" ON "empresas"
  FOR ALL TO nomina_app
  USING      ("id" = NULLIF(current_setting('app.empresa_id', true), '')::uuid)
  WITH CHECK ("id" = NULLIF(current_setting('app.empresa_id', true), '')::uuid);

CREATE POLICY "sedes_aislamiento" ON "sedes"
  FOR ALL TO nomina_app
  USING      ("empresa_id" = NULLIF(current_setting('app.empresa_id', true), '')::uuid)
  WITH CHECK ("empresa_id" = NULLIF(current_setting('app.empresa_id', true), '')::uuid);

-- ===== Permisos mínimos (sin DELETE) =====
GRANT SELECT, INSERT, UPDATE ON "empresas", "sedes" TO nomina_app;