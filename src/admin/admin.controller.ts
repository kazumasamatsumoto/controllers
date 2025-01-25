// controllers.mdの「サブドメインルーティング」セクションの実装
// サブドメインベースのルーティング（admin.localhost）
import { Controller, Get } from '@nestjs/common';

@Controller({ host: 'admin.localhost' })
export class AdminController {
  @Get()
  index(): string {
    return '管理者ページ';
  }
}
