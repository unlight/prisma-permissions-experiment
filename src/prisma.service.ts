import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      errorFormat: 'minimal',
      log: ['query'],
    });
    // @ts-ignore
    this.$on('query', (event: any) => {
      if (event.params === '[]') return;
      console.log(event.params, 'prisma:query:params');
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
