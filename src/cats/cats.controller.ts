import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  Header,
} from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ListAllEntities } from './dto/list-all-entities.dto';

// 基本的なルートプレフィックスの設定（/cats）
@Controller('cats')
export class CatsController {
  // POST /cats エンドポイント
  // - @HttpCode(204): 成功時に204 No Contentを返す
  // - @Header: キャッシュ制御ヘッダーを設定
  @Post()
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  create() {
    return 'This action adds a new cat';
  }

  // GET /cats エンドポイント
  // 全ての猫のリストを返す
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }

  // GET /cats/breed エンドポイント
  // 猫の品種リストを返す
  // 注: このルートは:idパラメータのルートより前に定義する必要がある
  @Get('breed')
  findBreeds(): string {
    return 'This action returns all cat breeds';
  }

  // GET /cats/:id エンドポイント
  // URLパラメータ:idを使用して特定の猫を取得
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  // PUT /cats/:id エンドポイント
  // 特定の猫の情報を更新
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  // DELETE /cats/:id エンドポイント
  // 特定の猫を削除
  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }

  // GET /cats/abcd/* エンドポイント
  // ワイルドカードルートの例
  // 注: NestJS最新バージョンでは*pathのような名前付きワイルドカードを使用
  @Get('abcd/*path')
  findWildcard() {
    return 'This route uses a wildcard';
  }
}
