# NestJSコントローラー入門

## このガイドについて

このガイドでは、NestJSの重要な概念である「コントローラー」について、実践的な例を交えながら学びます。猫(Cat)の情報を管理するRESTful APIを作成しながら、コントローラーの基本から応用までを理解していきます。

## 前提条件

- Node.js (v16以上)
- npm (v8以上)
- JavaScriptの基本的な文法
- TypeScriptの基本（デコレータ、クラス、型）
- HTTPリクエスト（GET、POST）の基礎

### 環境別の準備

#### Windows

- PowerShell

#### Mac/Linux

- Terminal

## 1. プロジェクトの作成

まずは新しいプロジェクトを作成します：

```bash
# NestJSプロジェクトの作成
nest new controller-sample

# プロジェクトのフォルダに移動
cd controller-sample
```

## 2. 基本的なコントローラーの実装

### コントローラーとは？

コントローラーは以下の役割を持ちます：

- 特定のURLパスでのリクエストの受け付け
- リクエストの処理とレスポンスの返却
- ビジネスロジック（サービス）の呼び出し

### 最もシンプルなコントローラー

まず、最も基本的なコントローラーを作成してみましょう：

```typescript
// src/cats/cats.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('cats') // '/cats'というURLパスを処理
export class CatsController {
  @Get() // GETリクエストを処理
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

このコードについて解説します：

1. `@Controller('cats')`

   - このデコレータは、このクラスがコントローラーであることをNestJSに伝えます
   - 'cats'は「ルートプレフィックス」と呼ばれ、このコントローラーの全てのルートの前に付加されます
   - 例：`/cats`、`/cats/1`など

2. `@Get()`
   - HTTPのGETメソッドを処理することを示します
   - 他にも`@Post()`、`@Put()`、`@Delete()`などがあります

### リクエストの処理

実際のアプリケーションでは、クライアントから送られてくるデータを処理する必要があります：

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    // @Body()デコレータでリクエストボディを受け取る
    return `Creating a cat with name: ${createCatDto.name}`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // @Param()デコレータでURLパラメータを受け取る
    return `This action returns a #${id} cat`;
  }
}
```

### DTOの作成

DTOは「Data Transfer Object」の略で、クライアントとサーバー間でデータをやり取りする際の形式を定義します：

```typescript
// src/cats/dto/create-cat.dto.ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

> 重要：なぜインターフェースではなくクラスを使うのか？
>
> - クラスはJavaScriptのランタイムで実際のエンティティとして存在します
> - インターフェースはコンパイル時に削除されます
> - NestJSの機能（例：バリデーション）は実行時のメタデータを必要とします

### レスポンスの処理

NestJSには2つのレスポンス処理方法があります：

1. 標準アプローチ（推奨）：

```typescript
@Get()
findAll() {
  return ['cat1', 'cat2']; // 自動的にJSONレスポンスに変換される
}
```

2. ライブラリ固有のアプローチ：

```typescript
@Get()
findAll(@Res() response: Response) {
  response.status(200).json(['cat1', 'cat2']);
}
```

> 注意：`@Res()`を使用する場合、そのハンドラーは完全にレスポンス処理を担当する必要があります。

### ステータスコードの制御

デフォルトのステータスコードを変更する場合：

```typescript
@Post()
@HttpCode(201) // Created
create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

### エラーハンドリング

適切なエラーレスポンスを返すには：

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  try {
    // 何らかの処理
    throw new Error('Cat not found');
  } catch (error) {
    throw new HttpException('Cat not found', HttpStatus.NOT_FOUND);
  }
}
```

### リクエストオブジェクトの取得

リクエストの情報を取得する方法は、用途によって2つのアプローチがあります：

![リクエストオブジェクトの取得方法](/request-handling-approaches.svg)

#### 1. リクエストオブジェクト全体が必要な場合

リクエストの全ての情報（ヘッダー、クエリ、ボディ、IPアドレスなど）にアクセスしたい場合は、`@Req()`デコレータを使用します：

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    // リクエストの全情報にアクセス可能
    console.log(request.headers); // 全てのヘッダー
    console.log(request.query); // 全てのクエリパラメータ
    console.log(request.body); // リクエストボディ
    console.log(request.cookies); // クッキー
    console.log(request.ip); // クライアントのIP
    console.log(request.protocol); // プロトコル（http/https）
    return 'This action returns all cats';
  }
}
```

このアプローチは以下の場合に有用です：

- ロギングやデバッグで詳細な情報が必要な場合
- カスタムミドルウェアを作成する場合
- リクエストの複数の部分を同時に処理する場合

#### 2. 特定の情報だけが必要な場合（推奨）

ほとんどの場合、リクエストの特定の部分だけが必要です。そのような場合は、目的に特化した専用デコレータを使用します：

```typescript
@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(
    @Param('id') id: string, // URLパラメータだけを取得
    @Query('type') type?: string, // 特定のクエリパラメータだけを取得
  ) {
    return `Finding cat #${id} of type ${type}`;
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    // ボディだけを取得
    return 'This action adds a new cat';
  }
}
```

このアプローチのメリット：

- コードが読みやすく、意図が明確
- 型安全性が向上（TypeScriptの恩恵を最大限に受けられる）
- テストが書きやすい（必要な部分だけをモック化できる）
- 将来的なリファクタリングが容易

> ベストプラクティス：特に理由がない限り、専用デコレータの使用を推奨します。
> これにより、コードの意図が明確になり、保守性が向上します。

## 実践：猫管理APIの実装

### 1. 必要なパッケージのインストール

```bash
# バリデーション用パッケージのインストール
npm install --save class-validator class-transformer
```

### 2. DTOの作成

```typescript
// src/cats/dto/create-cat.dto.ts
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

### 3. バリデーションの設定

```typescript
// src/main.ts
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

### 4. コントローラーの実装

```typescript
// src/cats/cats.controller.ts
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

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query('limit') limit?: number) {
    return `This action returns all cats (limit: ${limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: any) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

### 5. APIのテスト

環境に応じて以下のコマンドでAPIをテストできます：

#### Windows (PowerShell)

```powershell
# 新しい猫を作成
Invoke-WebRequest -Uri "http://localhost:3000/cats" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name": "タマ", "age": 3, "breed": "雑種"}'

# 全ての猫を取得
Invoke-WebRequest -Uri "http://localhost:3000/cats" -Method GET
```

#### Mac/Linux

```bash
# 新しい猫を作成
curl -X POST http://localhost:3000/cats \
  -H "Content-Type: application/json" \
  -d '{"name": "タマ", "age": 3, "breed": "雑種"}'

# 全ての猫を取得
curl http://localhost:3000/cats
```

## 発展的なトピック

基本を理解したら、以下の機能も試してみましょう：

1. カスタムデコレータの作成
2. インターセプターの使用
3. バリデーションパイプの実装
4. ガードによる認証の追加
5. サブドメインルーティング
6. マルチテナント対応

## トラブルシューティング

よくある問題と解決方法：

1. バリデーションエラー

   - DTOの定義を確認
   - ValidationPipeが正しく設定されているか確認

2. ルーティングエラー

   - コントローラーのデコレータのパスを確認
   - モジュールへの登録を確認

3. 型エラー
   - DTOの型定義を確認
   - TypeScriptの設定を確認

## 参考リンク

- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [NestJSの日本語コミュニティ](https://nestjs-jp.com/)
- Stack Overflow
