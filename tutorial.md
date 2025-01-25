# NestJSコントローラーチュートリアル

このチュートリアルでは、NestJSのコントローラーの基本的な機能を学びます。
猫(Cat)の情報を管理するRESTful APIを作成していきます。

## 前提条件

- Node.js (v16以上)
- npm (v8以上)

### 環境別の準備

#### Windows

- PowerShell

#### Mac/Linux

- Terminal

## 1. プロジェクトのセットアップ

まず、NestJSのCLIをグローバルにインストールし、新しいプロジェクトを作成します:

```bash
# 共通
# NestJS CLIのインストール
npm i -g @nestjs/cli

# プロジェクトの作成
nest new nestjs-controller-tutorial
cd nestjs-controller-tutorial

# 依存パッケージのインストール
npm install
```

## 2. Catコントローラーの作成

NestJS CLIを使用してコントローラーを生成します:

```bash
# 共通
# cats コントローラーの生成
nest g controller cats
```

## 3. DTOの作成

まず、バリデーション用のパッケージをインストールします：

```bash
# 共通
# バリデーションに必要なパッケージをインストール
npm install --save class-validator class-transformer
```

`src/cats/dto`ディレクトリを作成し、以下のDTOファイルを作成します:

```bash
# 共通
mkdir -p src/cats/dto
```

```typescript:src/cats/dto/create-cat.dto.ts
import { IsString, IsInt, Min } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  breed: string;
}
```

```typescript:src/cats/dto/update-cat.dto.ts
export class UpdateCatDto {
  name?: string;
  age?: number;
  breed?: string;
}
```

```typescript:src/cats/dto/list-all-entities.dto.ts
export class ListAllEntities {
  limit: number;
}
```

## 4. バリデーションの設定

`src/main.ts`を編集してグローバルにバリデーションを有効にします：

```typescript:src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

これにより：

- リクエストボディの自動バリデーション
- 不正なプロパティの自動除外
- 型変換の自動実行
  が有効になります。

## 5. コントローラーの実装

### 基本的なコントローラー

`src/cats/cats.controller.ts`を以下のように実装します:

```typescript:src/cats/cats.controller.ts
import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ListAllEntities } from './dto/list-all-entities.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

### サブドメインルーティング

> 重要: ローカル環境でサブドメインをテストするには、hostsファイルの設定が必要です。

⚠️ 注意事項:

1. hostsファイルは、システム全体のDNS解決に影響を与えます
2. 他の開発プロジェクトで同じサブドメインを使用している場合、競合が発生する可能性があります
3. テスト完了後は、追加した設定を削除することを推奨します

代替手段:

- テスト時のみ`Headers`を使用する方法（推奨）

```powershell
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -Headers @{"Host"="admin.localhost"}
```

```bash
# Mac/Linux
curl -H "Host: admin.localhost" http://localhost:3000
```

#### hostsファイルの設定

##### Windows

1. メモ帳を管理者権限で開く
2. `C:\Windows\System32\drivers\etc\hosts`を開く
3. 以下の行を追加:

```
127.0.0.1 admin.localhost
127.0.0.1 tenant1.localhost
```

##### Mac/Linux

1. `/etc/hosts`を編集:

```bash
sudo nano /etc/hosts
```

2. 以下の行を追加:

```
127.0.0.1 admin.localhost
127.0.0.1 tenant1.localhost
```

`src/admin/admin.controller.ts`を作成します：

```bash
# 共通
nest g controller admin
```

```typescript:src/admin/admin.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller({ host: 'admin.localhost' })
export class AdminController {
  @Get()
  index(): string {
    return '管理者ページ';
  }
}
```

また、マルチテナント用のコントローラーも作成します：

```typescript:src/tenant/tenant.controller.ts
import { Controller, Get, HostParam } from '@nestjs/common';

@Controller({ host: ':tenant.localhost' })
export class TenantController {
  @Get()
  getTenantInfo(@HostParam('tenant') tenant: string) {
    return `${tenant}のページです`;
  }
}
```

> 注意: サブドメインルーティングを使用する場合は、Expressアダプターを使用する必要があります。
> Fastifyではサブドメインルーティングはサポートされていません。

## 6. アプリケーションの起動

```bash
# 共通
npm run start:dev
```

## 7. APIのテスト

環境に応じて以下のコマンドを使用してAPIをテストできます:

### サブドメインルーティングのテスト

#### Windows (PowerShell)

```powershell
# 管理者ページにアクセス
Invoke-WebRequest -Uri "http://admin.localhost:3000" -Method GET -Headers @{"Host"="admin.localhost"}

# テナントページにアクセス
Invoke-WebRequest -Uri "http://tenant1.localhost:3000" -Method GET -Headers @{"Host"="tenant1.localhost"}
```

#### Mac/Linux

```bash
# 管理者ページにアクセス
curl -H "Host: admin.localhost" http://localhost:3000

# テナントページにアクセス
curl -H "Host: tenant1.localhost" http://localhost:3000
```

### 新しい猫を作成

#### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/cats" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name": "タマ", "age": 3, "breed": "雑種"}'
```

#### Mac/Linux

```bash
curl -X POST http://localhost:3000/cats \
  -H "Content-Type: application/json" \
  -d '{"name": "タマ", "age": 3, "breed": "雑種"}'
```

### 全ての猫を取得

#### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/cats" -Method GET
```

#### Mac/Linux

```bash
curl http://localhost:3000/cats
```

### 猫の品種を取得

#### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/cats/breed" -Method GET
```

#### Mac/Linux

```bash
curl http://localhost:3000/cats/breed
```

### ワイルドカードルートのテスト

> 注意: NestJSの最新バージョンでは、ワイルドカードパラメータに名前を付ける必要があります。
> 例: `*` → `*path`

#### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/cats/abcd/anything/else/more" -Method GET
```

## 8. 動作確認

### Windows (PowerShell)での実行結果

#### 新しい猫を作成 (POST /cats)

```
StatusCode        : 204
StatusDescription : Created
Content           : This action adds a new cat
Headers           : {
  "Cache-Control": "no-store"
}
```

#### 全ての猫を取得 (GET /cats)

```
StatusCode        : 200
StatusDescription : OK
Content           : This action returns all cats
```

#### 特定の猫を取得 (GET /cats/1)

```
StatusCode        : 200
StatusDescription : OK
Content           : This action returns a #1 cat
```

#### 猫の情報を更新 (PUT /cats/1)

```
StatusCode        : 200
StatusDescription : OK
Content           : This action updates a #1 cat
```

#### 猫を削除 (DELETE /cats/1)

```
StatusCode        : 200
StatusDescription : OK
Content           : This action removes a #1 cat
```

各レスポンスには上記以外にも以下のような情報が含まれています：

- Headers (X-Powered-By, ETag, Date など)
- RawContent (生のHTTPレスポンス)
- その他のメタデータ

> 注: Mac/Linuxの場合は`curl`コマンドを使用し、異なる形式でレスポンスが表示されます。

## まとめ

このチュートリアルでは:

1. NestJSプロジェクトの作成
2. コントローラーの生成
3. DTOの作成
4. バリデーションの設定
5. RESTful APIエンドポイントの実装
6. APIのテスト

を行いました。これらの基本を理解することで、より複雑なアプリケーションの開発に進むことができます。
