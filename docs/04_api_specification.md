# 4. API仕様書 (簡易版)

## 4.1. 認証
- `GET /api/auth/session`: セッション情報を取得

## 4.2. プロジェクト
- **`GET /api/projects`**:
  - **説明**: ログインユーザーが所属するプロジェクト一覧を取得
  - **レスポンス (200 OK)**: `[{id, name, ...}]`
- **`POST /api/projects`**:
  - **説明**: 新規プロジェクトを作成
  - **リクエストボディ**: `{ "name": "新しいプロジェクト", "description": "..." }`
  - **レスポンス (201 Created)**: `{id, name, ...}`
- **`GET /api/projects/:projectId`**:
  - **説明**: 指定したプロジェクトの詳細とタスク一覧を取得
  - **レスポンス (200 OK)**: `{id, name, description, tasks: [...]}`
- **`PUT /api/projects/:projectId`**:
  - **説明**: プロジェクト情報を更新
  - **リクエストボディ**: `{ "name": "更新後の名前" }`
- **`DELETE /api/projects/:projectId`**:
  - **説明**: プロジェクトを削除

## 4.3. タスク
- **`POST /api/tasks`**:
  - **説明**: 新規タスクを作成
  - **リクエストボディ**: `{ "title": "...", "projectId": "...", ... }`
- **`PUT /api/tasks/:taskId`**:
  - **説明**: タスク情報を更新（ステータス、担当者など）
  - **リクエストボディ**: `{ "status": "in_progress" }`
- **`DELETE /api/tasks/:taskId`**:
  - **説明**: タスクを削除
