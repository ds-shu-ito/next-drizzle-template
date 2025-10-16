# 2. 基本設計書

## 2.1. システムアーキテクチャ
標準的なWebアプリケーション構成とする。クライアントはNext.jsで構築されたSPA（Single Page Application）として動作し、バックエンドのAPIサーバー（Next.js App RouterのRoute Handlers）と通信する。

## 2.2. 使用技術スタック
フロントエンド: Next.js (App Router), React, TypeScript, Tailwind CSS

バックエンド: Next.js (App Router), TypeScript

データベース: MySQL

ORM: Drizzle ORM

## 2.3. ディレクトリ構成（src/配下）
src/
├── app/                  # App Router
│   ├── (auth)/           # 認証関連ページ (ログインなど)
│   ├── (main)/           # メインアプリページ
│   │   ├── dashboard/
│   │   └── projects/
│   │       └── [projectId]/
│   └── api/              # API Route Handlers
├── components/           # 再利用可能なUIコンポーネント
│   ├── common/
│   └── features/
├── lib/                  # ライブラリ、ヘルパー関数
└── db/                   # Drizzle ORMの設定、スキーマ
