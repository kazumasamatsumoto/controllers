# 100 文字要約

NestJS のコントローラーについての解説文書です。コントローラーはクライアントからのリクエストを処理し、レスポンスを返す役割を持ち、デコレータを使用して実装します。ルーティング、HTTP メソッド、パラメータ処理など、基本的な機能を提供します。

## コントローラーの責務

![NestJSコントローラーの役割と解決方法](/overview/svg/2_controllers/controller-role-and-solutions.svg)

## 全体像

![全体像](/overview/svg/2_controllers/controller-concept-map-improved.svg)

# コントローラー

コントローラーは、クライアントからの着信リクエストを処理し、レスポンスを返す役割を担います。

コントローラーの目的は、アプリケーションへの特定のリクエストを受け取ることです。ルーティングメカニズムが、どのコントローラーがどのリクエストを受け取るかを制御します。通常、各コントローラーは複数のルートを持ち、異なるルートで異なるアクションを実行できます。

基本的なコントローラーを作成するには、クラスとデコレータを使用します。デコレータはクラスに必要なメタデータを関連付け、Nest がルーティングマップ（リクエストと対応するコントローラーの紐付け）を作成できるようにします。

> ヒント
> バリデーション機能が組み込まれた CRUD コントローラーを素早く作成するには、CLI の CRUD ジェネレーターを使用できます：`nest g resource [name]`

## ルーティング

以下の例では、基本的なコントローラーを定義するために必要な`@Controller()`デコレータを使用します。オプションのルートパスプレフィックスとして`cats`を指定します。`@Controller()`デコレータでパスプレフィックスを使用することで、関連するルートのグループ化が容易になり、コードの重複を最小限に抑えることができます。例えば、cat エンティティとのやり取りを管理する一連のルートを`/cats`ルートの下にグループ化することができます。

```typescript
// cats.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

![まずはここの基礎を図式化します](/overview/svg/2_controllers/controller-routing-flow.svg)

> ヒント
> CLI を使用してコントローラーを作成するには、`$ nest g controller [name]`コマンドを実行するだけです。

`findAll()`メソッドの前の`@Get()`HTTP リクエストメソッドデコレータは、特定のエンドポイントに対するハンドラーを作成するよう Nest に指示します。エンドポイントは、HTTP リクエストメソッド（この場合は GET）とルートパスに対応します。

ルートパスはどのように決定されるのでしょうか？ハンドラーのルートパスは、コントローラーに宣言された（オプションの）プレフィックスと、メソッドのデコレータで指定されたパスを連結して決定されます。すべてのルートにプレフィックス（`cats`）を宣言し、デコレータにパス情報を追加していないため、Nest は GET `/cats`リクエストをこのハンドラーにマッピングします。

前述したように、パスにはコントローラーのパスプレフィックス（オプション）とリクエストメソッドデコレータで宣言されたパス文字列の両方が含まれます。例えば、`cats`というパスプレフィックスと`@Get('breed')`デコレータを組み合わせると、`GET /cats/breed`のようなリクエストに対するルートマッピングが生成されます。

```ts
// breedを追加した例
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }

  @Get('breed') // /cats/breed へのルーティング
  findBreeds(): string {
    return 'This action returns all cat breeds';
  }
}
```

上記の例では、このエンドポイントに GET リクエストが行われると、Nest はリクエストを私たちが定義した`findAll()`メソッドにルーティングします。メソッド名は完全に任意であることに注意してください。ルートにバインドするメソッドを宣言する必要はありますが、Nest はメソッド名に特別な意味を持たせません。

このメソッドは 200 のステータスコードと、この場合は単なる文字列であるレスポンスを返します。なぜこれが起こるのでしょうか？説明するために、まず Nest がレスポンスを操作するために採用している 2 つの異なるオプションを紹介します：

![2つの異なるオプション](/overview/svg/2_controllers/controller-response-approaches.svg)

### 標準（推奨）

この組み込みメソッドを使用する場合：

- リクエストハンドラーが JavaScript のオブジェクトや配列を返すと、自動的に JSON にシリアライズされます。
- JavaScript のプリミティブ型（文字列、数値、真偽値など）を返す場合、Nest はシリアライズを試みずに値をそのまま送信します。
- これによりレスポンス処理が簡単になります：値を返すだけで、残りは Nest が処理します。

さらに、レスポンスのステータスコードは、POST リクエスト（201 を使用）を除いて、デフォルトで常に 200 です。ハンドラーレベルで`@HttpCode(...)`デコレータを追加することで、この動作を簡単に変更できます。

### ライブラリ固有

- ライブラリ固有（例：Express）のレスポンスオブジェクトを使用できます。
- これはメソッドハンドラーのシグネチャで`@Res()`デコレータを使用して注入できます（例：`findAll(@Res() response)`）。
- このアプローチでは、そのオブジェクトが公開するネイティブのレスポンス処理メソッドを使用できます。
- 例えば、Express では`response.status(200).send()`のようなコードでレスポンスを構築できます。

> 警告
> Nest はハンドラーが`@Res()`または`@Next()`を使用していることを検出すると、ライブラリ固有のオプションを選択したと判断します。両方のアプローチを同時に使用すると、このルートに対して標準アプローチは自動的に無効になり、期待通りに動作しなくなります。両方のアプローチを同時に使用するには（例：クッキー/ヘッダーの設定のみにレスポンスオブジェクトを注入し、残りはフレームワークに任せる場合）、`@Res({ passthrough: true })`デコレータで passthrough オプションを true に設定する必要があります。

```ts
// 推奨されない方法（混乱を招く）
@Get()
handler(@Res() res, @Next() next) {
    res.cookie('key', 'value');
    return 'このデータは期待通りに送信されない可能性があります';
}

// 推奨される方法
@Get()
handler(@Res({ passthrough: true }) res) {
    res.cookie('key', 'value');
    return 'このデータは正しく送信されます';  // NestJSが処理します
}
```

![二つの方法を検討](/overview/svg/2_controllers/response-handling-flow.svg)

## リクエストオブジェクト

ハンドラーは多くの場合、クライアントリクエストの詳細にアクセスする必要があります。Nest は基盤となるプラットフォーム（デフォルトでは Express）のリクエストオブジェクトへのアクセスを提供します。ハンドラーのシグネチャに`@Req()`デコレータを追加することで、Nest にリクエストオブジェクトを注入するよう指示できます。

```typescript
// cats.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

> ヒント
> Express 用の型定義（上記の例の`request: Request`パラメータなど）を利用するには、`@types/express`パッケージをインストールしてください。

リクエストオブジェクトは HTTP リクエストを表し、クエリ文字列、パラメータ、HTTP ヘッダー、本文などのプロパティを持っています。ほとんどの場合、これらのプロパティを手動で取得する必要はありません。代わりに、すぐに使える`@Body()`や`@Query()`などの専用デコレータを使用できます。以下は、提供されているデコレータと、それらが表すプラットフォーム固有のオブジェクトの一覧です：

- `@Request()`、`@Req()` → `req`
- `@Response()`、`@Res()`\* → `res`
- `@Next()` → `next`
- `@Session()` → `req.session`
- `@Param(key?: string)` → `req.params` / `req.params[key]`
- `@Body(key?: string)` → `req.body` / `req.body[key]`
- `@Query(key?: string)` → `req.query` / `req.query[key]`
- `@Headers(name?: string)` → `req.headers` / `req.headers[name]`
- `@Ip()` → `req.ip`
- `@HostParam()` → `req.hosts`

* 基盤となる HTTP プラットフォーム（Express や Fastify など）間での型の互換性のため、Nest は`@Res()`と`@Response()`デコレータを提供しています。`@Res()`は単に`@Response()`のエイリアスです。両者とも、基盤となるネイティブプラットフォームのレスポンスオブジェクトインターフェースを直接公開します。

![NestJSデコレータ一覧](/overview/svg/2_controllers/controller-decorators-table.svg)

## リソース

先ほど、cats リソースを取得するエンドポイント（GET ルート）を定義しました。通常、新しいレコードを作成するエンドポイントも提供したいと思います。そのために、POST ハンドラーを作成しましょう：

```typescript
// cats.controller.ts
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

これだけです。Nest は標準的な HTTP メソッド全てにデコレータを提供しています：`@Get()`、`@Post()`、`@Put()`、`@Delete()`、`@Patch()`、`@Options()`、`@Head()`です。さらに、`@All()`はこれら全てを処理するエンドポイントを定義します。

![NestJS HTTPメソッドデコレータ一覧](/overview/svg/2_controllers/http-method-decorators-table.svg)

## ワイルドカードルート

NestJS ではパターンベースのルートもサポートされています。例えば、アスタリスク（\*）をワイルドカードとして使用して、パスの末尾の任意の文字の組み合わせにマッチさせることができます。

以下の例では、`findAll()`メソッドは、`abcd/`で始まるルートに対して、その後に続く文字数に関係なく実行されます：

```typescript
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
```

`'abcd/*'`というルートパスは、`abcd/`、`abcd/123`、`abcd/abc`などにマッチします。ハイフン（-）とドット（.）は文字列ベースのパスでは文字通りに解釈されます。

ルート中央でアスタリスクを使用する場合、Express は名前付きワイルドカード（例：`ab{*splat}cd`）を必要としますが、Fastify はこれを全くサポートしていません。

## ステータスコード

前述のように、レスポンスのステータスコードは、POST リクエスト（201）を除いて、デフォルトで常に 200 です。ハンドラーレベルで`@HttpCode(...)`デコレータを追加することで、この動作を簡単に変更できます：

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

> ヒント
> `HttpCode`は`@nestjs/common`パッケージからインポートします。

多くの場合、ステータスコードは静的ではなく、様々な要因に依存します。その場合、ライブラリ固有のレスポンスオブジェクト（`@Res()`を使用して注入）を使用するか、エラーの場合は例外をスローすることができます。

![ステータスコードの例](/overview/svg/2_controllers/http-status-codes-table.svg)

## ヘッダー

カスタムレスポンスヘッダーを指定するには、`@Header()`デコレータを使用するか、ライブラリ固有のレスポンスオブジェクト（`res.header()`を直接呼び出す）を使用します：

```typescript
@Post()
@Header('Cache-Control', 'no-store')
create() {
  return 'This action adds a new cat';
}
```

ヘッダーの用途について説明させていただきます。

> レスポンスヘッダーは、以下のような重要な用途で使用されます：

1. **キャッシュ制御**

```typescript
@Header('Cache-Control', 'no-store') // ブラウザにキャッシュさせない
@Header('Cache-Control', 'max-age=3600') // 1時間キャッシュを許可
```

2. **セキュリティ対策**

```typescript
@Header('X-Frame-Options', 'DENY') // クリックジャッキング対策
@Header('Content-Security-Policy', "default-src 'self'") // XSS対策
```

3. **CORS 設定**

```typescript
@Header('Access-Control-Allow-Origin', 'https://example.com')
@Header('Access-Control-Allow-Methods', 'GET,POST')
```

4. **コンテンツタイプの指定**

```typescript
@Header('Content-Type', 'application/json')
@Header('Content-Type', 'text/plain')
```

5. **認証・認可**

```typescript
@Header('WWW-Authenticate', 'Bearer')
```

このように、ヘッダーは Web アプリケーションの:

- セキュリティ
- パフォーマンス最適化
- ブラウザの動作制御
- クライアント-サーバー間の通信制御

などの重要な役割を担っています。

NestJS では`@Header()`デコレータを使用することで、これらのヘッダーを簡単に設定できます。また、より動的な制御が必要な場合は、`@Res()`を使用してレスポンスオブジェクトを直接操作することもできます。

> ヒント
> `Header`は`@nestjs/common`パッケージからインポートします。

## リダイレクト

レスポンスを特定の URL にリダイレクトするには、`@Redirect()`デコレータを使用するか、ライブラリ固有のレスポンスオブジェクト（`res.redirect()`を直接呼び出す）を使用できます。

`@Redirect()`は 2 つの引数（`url`と`statusCode`）を取り、どちらもオプションです。省略した場合、`statusCode`のデフォルト値は 302（Found）です：

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

### リダイレクトの主なユースケース

![リダイレクトの主なユースケース](/overview/svg/2_controllers/controller-redirect-usecase.svg)

1. **認証・認可後のリダイレクト**

```typescript
@Get('login')
@Redirect()
async login() {
  // 認証後に適切なページへリダイレクト
  return {
    url: isAdmin ? '/admin/dashboard' : '/user/dashboard',
    statusCode: 302
  };
}
```

2. **URL の正規化**

```typescript
@Get('old-path')
@Redirect('new-path', 301)  // 301は永続的リダイレクト
oldToNew() {
  // 古いURLから新しいURLへの恒久的なリダイレクト
}
```

3. **言語・地域に基づくリダイレクト**

```typescript
@Get()
@Redirect()
async detectLocale(@Headers('accept-language') language: string) {
  return {
    url: `/${language}/home`,
    statusCode: 302
  };
}
```

4. **A/B テスト**

```typescript
@Get('campaign')
@Redirect()
async abTest() {
  // ユーザーを異なるバージョンにランダムに振り分け
  return {
    url: Math.random() > 0.5 ? '/version-a' : '/version-b',
    statusCode: 302
  };
}
```

5. **メンテナンス・障害時の切り替え**

```typescript
@Get('service')
@Redirect()
async checkService() {
  if (isMaintenanceMode) {
    return { url: '/maintenance', statusCode: 307 }; // 一時的リダイレクト
  }
  return { url: '/service', statusCode: 200 };
}
```

このように、リダイレクト機能は:

- ユーザー体験の最適化
- システムの柔軟な運用
- セキュリティ制御
- トラフィック制御

などの重要な役割を果たします。NestJS の`@Redirect()`デコレータを使用することで、これらの実装を簡潔に行うことができます。

## サブドメインルーティング

`@Controller`デコレータは`host`オプションを取ることができ、これにより着信リクエストの HTTP ホストが特定の値に一致することを要求できます：

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

> 警告
> Fastify はネストされたルーターをサポートしていないため、サブドメインルーティングを使用する場合は、デフォルトの Express アダプターを使用することをお勧めします。

ルートパスと同様に、`hosts`オプションでもトークンを使用してホスト名のその位置の動的な値を取得できます。以下の`@Controller()`デコレータの例でこの使用法を示します。このように宣言されたホストパラメータには、メソッドのシグネチャに追加する`@HostParam()`デコレータを使用してアクセスできます：

```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

サブドメインルーティングについて具体例を交えて説明させていただきます。

### サブドメインルーティングとは？

サブドメインとは、メインドメインの前につけられる追加的なドメイン部分です。例えば：

- `example.com` がメインドメインの場合
- `admin.example.com`
- `blog.example.com`
- `api.example.com`
  などがサブドメインとなります。

### 実装例と使用例

1. **管理者用インターフェース**

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return '管理者ページ'; // admin.example.com にアクセスした時のみ実行
  }
}
```

2. **マルチテナント対応**

```typescript
@Controller({ host: ':tenant.example.com' })
export class TenantController {
  @Get()
  getTenantInfo(@HostParam('tenant') tenant: string) {
    // company1.example.com → tenant = "company1"
    // company2.example.com → tenant = "company2"
    return `${tenant}のページです`;
  }
}
```

### 主な用途

1. **機能の分離**

   - 管理画面（admin.example.com）
   - API（api.example.com）
   - ブログ（blog.example.com）

2. **マルチテナント**

   - client1.example.com
   - client2.example.com
   - client3.example.com

3. **地域・言語別サイト**
   - jp.example.com
   - us.example.com
   - uk.example.com

### 注意点

```typescript
// ⚠️ Fastifyでは動作しません
@Controller({ host: 'admin.example.com' })
export class AdminController {}

// ✅ Expressでは問題なく動作します
@Controller({ host: 'admin.example.com' })
export class AdminController {}
```

このように、サブドメインルーティングは異なるサブドメインへのアクセスを異なるコントローラーで処理できる機能です。マルチテナントシステムや機能の論理的な分離に特に有用です。

## スコープ

NestJS のインスタンス共有モデルは、他の言語からの開発者にとって意外かもしれません。

![NestJSインスタンス共有モデル](/overview/svg/2_controllers/controller-scope-concept.svg)

### シングルトンスコープ

- アプリケーション起動時に 1 回だけインスタンス化
- メモリに常駐し続ける
- 全てのリクエストで同じインスタンスを共有

```typescript
@Injectable()
export class DatabaseService {
  constructor() {
    // アプリケーション起動時に1回だけ実行される
    console.log('データベース接続を確立');
  }
}
```

### リクエストスコープ

- リクエストが来るたびに新しいインスタンスを作成
- リクエスト完了後にガベージコレクション
- リクエストごとに独立した状態を持つ

```typescript
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  constructor() {
    // リクエストごとに実行される
    console.log('新しいユーザーコンテキストを作成');
  }
}
```

![スコープのインスタンスのライフサイクル](/overview/svg/2_controllers/controller-scope-lifecycle.svg)

このように：

1. シングルトンスコープのインスタンスは「一度作って長く使う」
2. リクエストスコープのインスタンスは「必要な時に作って、すぐ捨てる」

という特徴を持っています。これにより、メモリ使用とパフォーマンスの最適なバランスを取ることができます。

### デフォルトの動作（シングルトン）

- データベース接続
- サービスインスタンス
- グローバル状態
  これらは全てのリクエスト間で共有されます。

### なぜ安全なのか？

Node.js は他の言語（Java, PHP など）とは異なり、リクエストごとに新しいスレッドやプロセスを作成しません。代わりに、単一のイベントループモデルを使用します。そのため、シングルトンインスタンスの使用は安全です。

### リクエストスコープ

ただし、リクエストごとに新しいインスタンスが必要な場合もあります。例えば：

- リクエストごとのキャッシュ管理
- リクエストトラッキング
- マルチテナンシー（複数顧客対応）
- ユーザー固有の状態管理

スコープの制御方法については[こちら]で学ぶことができます。

## 非同期性

私たちは現代の JavaScript を愛しており、データの抽出のほとんどが非同期であることを知っています。そのため、Nest は非同期関数をサポートし、うまく連携します。

## リクエストペイロード

### リクエストの構造とペイロード

HTTP リクエストの構造を図で表すと以下のようになります：

```
┌──────────────── HTTPリクエスト ────────────────┐
│                                                │
│ ┌────────── リクエストライン ──────────┐        │
│ │ POST /api/cats HTTP/1.1             │        │
│ └─────────────────────────────────────┘        │
│                                                │
│ ┌────────── ヘッダー ──────────────────┐       │
│ │ Host: example.com                    │       │
│ │ Content-Type: application/json       │       │
│ │ Authorization: Bearer xxx...         │       │
│ └─────────────────────────────────────┘        │
│                                                │
│ ┌────────── ペイロード ─────────────────┐      │
│ │ {                                     │      │
│ │   "name": "タマ",                     │      │
│ │   "age": 3,                           │      │
│ │   "breed": "雑種"                     │      │
│ │ }                                     │      │
│ └─────────────────────────────────────┘        │
│                                                │
└────────────────────────────────────────────────┘
```

### リクエストの各部分の説明

1. **リクエストライン**

   - HTTP メソッド（GET, POST, PUT, DELETE 等）
   - リクエストパス（/api/cats）
   - HTTP バージョン

2. **ヘッダー**

   - リクエストに関する付加情報
   - Content-Type, Authorization 等の情報を含む

3. **ペイロード**（リクエストボディ）
   - リクエストの本体部分
   - POST や PUT リクエストで送信したいデータを含む
   - 上記の例では、新しく作成する猫の情報が JSON 形式で含まれている

このペイロード部分が、先ほど説明した DTO クラスにマッピングされます：

```typescript
export class CreateCatDto {
  name: string; // "タマ"がマッピング
  age: number; // 3がマッピング
  breed: string; // "雑種"がマッピング
}
```

### リクエストペイロードのマッピング

これまでの POST ルートハンドラーの例では、クライアントのパラメータを受け取っていませんでした。ここで`@Body()`デコレータを追加して、この問題を解決しましょう。

ただし最初に（TypeScript を使用している場合）、DTO（Data Transfer Object）スキーマを定義する必要があります。DTO は、データがネットワーク上でどのように送信されるかを定義するオブジェクトです。DTO スキーマは TypeScript インターフェースか、単純なクラスを使用して定義できます。興味深いことに、ここではクラスの使用を推奨します。なぜでしょうか？

- クラスは JavaScript ES6 標準の一部であり、コンパイルされた JavaScript で実際のエンティティとして保持されます。
- 一方、TypeScript インターフェースはトランスパイル時に削除されるため、Nest は実行時にそれらを参照できません。
- これは重要です。なぜなら、Pipes などの機能は、実行時に変数のメタタイプにアクセスできる場合に追加の可能性を提供するためです。

では、CreateCatDto クラスを作成してみましょう：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

これには 3 つの基本的なプロパティしかありません。その後、新しく作成した DTO を CatsController で使用できます：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

> ヒント
> ValidationPipe は、メソッドハンドラーが受け取るべきでないプロパティをフィルタリングできます。この場合、受け入れ可能なプロパティをホワイトリストに登録でき、ホワイトリストに含まれていないプロパティは結果のオブジェクトから自動的に削除されます。CreateCatDto の例では、ホワイトリストは name、age、breed プロパティです。詳細は[こちら]で学べます。

## エラー処理

エラーの処理（つまり、例外の扱い）については、[こちら]の別の章で説明しています。

## 完全なリソースサンプル

以下は、基本的なコントローラーを作成するために利用可能な様々なデコレータを使用した例です。このコントローラーは、内部データにアクセスし操作するためのいくつかのメソッドを公開しています：

```typescript
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
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

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

> ヒント
> Nest CLI は、すべてのボイラープレートコードを自動生成してくれるジェネレーター（スキーマ）を提供しており、これらの作業を避け、開発者体験をよりシンプルにすることができます。この機能についての詳細は[こちら]で読むことができます。

## 始めるために

上記のコントローラーが完全に定義されていても、Nest はまだ CatsController が存在することを知らず、結果としてこのクラスのインスタンスを作成しません。

コントローラーは常にモジュールに属しているため、`@Module()`デコレータ内の`controllers`配列に含めます。root AppModule 以外のモジュールをまだ定義していないため、CatsController を導入するために AppModule を使用します：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

`@Module()`デコレータを使用してモジュールクラスにメタデータを付加し、これにより Nest は簡単にどのコントローラーをマウントする必要があるかを認識できます。

## ライブラリ固有のアプローチ

ここまでは、レスポンスを操作する Nest の標準的な方法について説明してきました。レスポンスを操作する 2 つ目の方法は、ライブラリ固有のレスポンスオブジェクトを使用することです。特定のレスポンスオブジェクトを注入するには、`@Res()`デコレータを使用する必要があります。違いを示すために、CatsController を以下のように書き直してみましょう：

```typescript
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
    res.status(HttpStatus.OK).json([]);
  }
}
```

このアプローチは機能し、実際にレスポンスオブジェクトの完全な制御（ヘッダーの操作、ライブラリ固有の機能など）を提供することで、ある意味でより柔軟性を提供しますが、注意して使用する必要があります。

一般的に、このアプローチはより明確さに欠け、いくつかの欠点があります：

- コードがプラットフォーム依存になる（基礎となるライブラリによってレスポンスオブジェクトの API が異なる可能性がある）
- テストが難しくなる（レスポンスオブジェクトのモックが必要になるなど）

また、上記の例では、Interceptors やデコレータなどの Nest の標準的なレスポンス処理に依存する機能との互換性が失われます。これを修正するには、以下のように passthrough オプションを true に設定できます：

```typescript
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
```

これで、ネイティブのレスポンスオブジェクトと対話できる（例：特定の条件に応じてクッキーやヘッダーを設定する）一方で、残りの処理はフレームワークに任せることができます。

## イベントループとリソース管理

イベントループは主に CPU とメモリリソースを管理します：

- **CPU**: タスクの実行とスケジューリング
- **メモリ**: データの一時保存と管理

> 注: その他のハードウェアリソース（ディスク I/O、ネットワークなど）へのアクセスは、
> 専用のサブシステムを通じて非同期に処理されます。
