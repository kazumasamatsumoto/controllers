import { Controller, Get, HostParam } from '@nestjs/common';

@Controller({ host: ':tenant.localhost' })
export class TenantController {
  @Get()
  getTenantInfo(@HostParam('tenant') tenant: string) {
    return `${tenant}のページです`;
  }
}
