// archivo: apps/api/src/prisma/prisma.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tipo del cliente dentro de una transacción.
export type TxClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const url = process.env['DATABASE_URL'];
    if (!url) throw new Error('Falta DATABASE_URL en el .env de la raíz');
    super({ adapter: new PrismaPg({ connectionString: url }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado a PostgreSQL como usuario de la aplicación');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Ejecuta `fn` dentro de una transacción con app.empresa_id fijado.
   * RLS garantiza que solo se vean y modifiquen datos de esa empresa.
   */
  async withEmpresa<T>(empresaId: string, fn: (tx: TxClient) => Promise<T>): Promise<T> {
    if (!UUID_REGEX.test(empresaId)) {
      throw new Error('empresaId inválido');
    }
    return this.$transaction(async (tx) => {
      // set_config(..., true) = SET LOCAL, pero acepta parámetros (sin inyección SQL)
      await tx.$executeRaw`SELECT set_config('app.empresa_id', ${empresaId}, true)`;
      return fn(tx);
    });
  }
}