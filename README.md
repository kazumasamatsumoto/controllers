# NestJSコントローラー入門

## このガイドについて

このガイドでは、NestJSの重要な概念である「コントローラー」について学びます。

コントローラーは、クライアントからのリクエストを受け取り、適切なレスポンスを返す役割を担います。NestJSでは、デコレータを使用して直感的にルーティングやリクエスト処理を実装できます。

## 前提知識

- JavaScriptの基本的な文法
- npmの基本的な使い方
- HTTPリクエスト（GET、POST）の基礎
- TypeScriptの基本（デコレータ、クラス、型）

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

## 3. 実践的な実装

ここまでの知識を活用して、実際のブログシステムを作ってみましょう：

```bash
# 必要なファイルを生成
nest g resource posts
```

このコマンドで以下のファイルが生成されます：

- `posts.controller.ts`: リクエストの処理
- `posts.service.ts`: ビジネスロジック
- `create-post.dto.ts`: 投稿作成時のデータ形式
- `update-post.dto.ts`: 投稿更新時のデータ形式

### バリデーションの追加

```bash
npm install class-validator class-transformer
```

```typescript
// src/posts/dto/create-post.dto.ts
import { IsString, IsNumber, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsNumber()
  authorId: number;
}
```

### 完全なコントローラーの実装

```typescript
// src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      return await this.postsService.create(createPostDto);
    } catch (error) {
      throw new HttpException(
        '投稿の作成に失敗しました',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.postsService.findAll({ page, limit });
  }

  // ... 他のメソッド
}
```

## 4. 動作確認

### サーバーの起動

```bash
npm run start:dev
```

### APIのテスト

```bash
# 投稿の作成
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"はじめての投稿","content":"この投稿はテストです","authorId":1}'

# 投稿一覧の取得
curl http://localhost:3000/posts
```

## 発展的なトピック

基本を理解したら、以下の機能も試してみましょう：

1. カスタムデコレータの作成
2. インターセプターの使用
3. バリデーションパイプの実装
4. ガードによる認証の追加

## 困ったときは？

- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [NestJSの日本語コミュニティ](https://nestjs-jp.com/)
- Stack Overflow
