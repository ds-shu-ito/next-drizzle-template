# 2. 基本設計書

## 2.1. システムアーキテクチャ
標準的なWebアプリケーション構成とする。クライアントはNext.jsで構築されたSPA（Single Page Application）として動作し、バックエンドのAPIサーバー（Next.js App RouterのRoute Handlers）と通信する。

## 2.2. 使用技術スタック

### フロントエンド
- **Next.js 15.5.5** (App Router)
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 4**
- **@dnd-kit** (ドラッグ＆ドロップ機能)

### バックエンド
- **Next.js App Router** (Route Handlers)
- **TypeScript 5**

### データベース
- **MySQL 8.0**
- **Drizzle ORM 0.44.6**

### 認証・セキュリティ
- **bcryptjs** (パスワードハッシュ化)
- **jsonwebtoken** (JWT認証)
- **next-auth 4.24.11** (認証フレームワーク)

### 開発ツール
- **Biome** (リンター・フォーマッター)
- **Drizzle Kit** (マイグレーション管理)

## 2.3. ディレクトリ構成（src/配下）
```
src/
├── app/                          # App Router
│   ├── (auth)/                   # 認証関連ページ
│   │   ├── login/                # ログインページ
│   │   └── signup/               # サインアップページ
│   ├── (main)/                   # メインアプリページ
│   │   └── projects/
│   │       └── [projectId]/      # プロジェクト詳細ページ
│   ├── api/                      # API Route Handlers
│   │   ├── auth/                 # 認証API
│   │   │   ├── login/            # ログインAPI
│   │   │   ├── signup/           # サインアップAPI
│   │   │   ├── logout/           # ログアウトAPI
│   │   │   └── session/          # セッション取得API
│   │   ├── projects/             # プロジェクトAPI
│   │   │   ├── route.ts          # プロジェクト一覧・作成
│   │   │   ├── [projectId]/      # プロジェクト詳細・編集・削除
│   │   │   └── [projectId]/members/ # プロジェクト参加者管理
│   │   └── tasks/                # タスクAPI
│   │       ├── route.ts          # タスク作成
│   │       └── [taskId]/         # タスク編集・削除
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # ホームページ（ダッシュボード）
├── components/                   # 再利用可能なUIコンポーネント
│   ├── auth/                     # 認証関連コンポーネント
│   │   ├── LoginForm.tsx         # ログインフォーム
│   │   └── SignupForm.tsx        # サインアップフォーム
│   ├── projects/                 # プロジェクト関連コンポーネント
│   │   ├── ProjectList.tsx       # プロジェクト一覧
│   │   ├── CreateProjectModal.tsx # プロジェクト作成モーダル
│   │   └── ProjectSettingsModal.tsx # プロジェクト設定モーダル
│   └── tasks/                    # タスク関連コンポーネント
│       ├── KanbanBoard.tsx       # カンバンボード
│       ├── TaskCard.tsx          # タスクカード
│       ├── DraggableTaskCard.tsx # ドラッグ可能なタスクカード
│       ├── TaskDetailModal.tsx   # タスク詳細モーダル
│       ├── CreateTaskModal.tsx   # タスク作成モーダル
│       └── DropZone.tsx          # ドロップゾーン
├── contexts/                     # React Context
│   └── AuthContext.tsx           # 認証状態管理
├── lib/                          # ライブラリ、ヘルパー関数
│   └── auth.ts                   # 認証関連ユーティリティ
└── db/                           # データベース関連
    ├── index.ts                  # データベース接続設定
    └── schema.ts                 # Drizzle ORMスキーマ定義
```

## 2.4. データベーススキーマ

### テーブル構成
- **users** - ユーザー情報
- **projects** - プロジェクト情報
- **projects_users** - プロジェクト参加者（中間テーブル）
- **tasks** - タスク情報
- **comments** - コメント情報

### リレーション
- ユーザー ↔ プロジェクト（多対多、権限付き）
- プロジェクト → タスク（1対多）
- ユーザー → タスク（1対多、担当者）
- タスク → コメント（1対多）

## 2.5. 認証・認可システム

### 認証方式
- JWT（JSON Web Token）ベースの認証
- クッキーベースのセッション管理
- パスワードのbcryptjsによるハッシュ化

### 権限管理
- **編集者（editor）**: プロジェクト・タスクの作成・編集・削除が可能
- **閲覧者（viewer）**: プロジェクト・タスクの閲覧のみ可能

## 2.6. 主要機能

### 実装済み機能
- ✅ ユーザー認証（サインアップ・ログイン・ログアウト）
- ✅ プロジェクト管理（作成・一覧表示・編集・削除）
- ✅ タスク管理（作成・編集・削除・ステータス変更）
- ✅ カンバンボード（ドラッグ＆ドロップ対応）
- ✅ プロジェクト参加者管理
- ✅ レスポンシブデザイン

### 今後の拡張予定
- 🔄 フィルター・検索機能
- 🔄 コメント機能
- 🔄 ダッシュボード機能
- 🔄 テスト実装
- 🔄 デプロイ準備
