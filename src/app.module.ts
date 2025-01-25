import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { AdminController } from './admin/admin.controller';
import { TenantController } from './tenant/tenant.controller';

@Module({
  controllers: [CatsController, AdminController, TenantController],
})
export class AppModule {}
