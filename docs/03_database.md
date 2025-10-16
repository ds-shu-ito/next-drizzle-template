# 3. データベース設計書

## 3.1. テーブル定義
### users
| カラム名     | データ型   | 制約              | 説明                 |
|-------------|-----------|-----------------|---------------------|
| id          | text      | PK              | ユーザーID           |
| name        | text      |                 | ユーザー名           |
| email       | text      | NOT NULL, UNIQUE | メールアドレス       |
| image       | text      |                 | プロフィール画像URL  |
| created_at  | timestamp | NOT NULL        | 作成日時             |

### projects
| カラム名     | データ型   | 制約       | 説明               |
|-------------|-----------|-----------|-------------------|
| id          | text      | PK        | プロジェクトID     |
| name        | text      | NOT NULL  | プロジェクト名     |
| description | text      |           | 説明               |
| created_at  | timestamp | NOT NULL  | 作成日時           |

### projects_users
| カラム名    | データ型 | 制約                   | 説明                  |
|------------|---------|----------------------|---------------------|
| user_id    | text    | PK, FK (users.id)    | ユーザーID           |
| project_id | text    | PK, FK (projects.id) | プロジェクトID       |
| role       | text    | NOT NULL             | 権限 ('editor','viewer') |

### tasks
| カラム名     | データ型 | 制約                                       | 説明           |
|-------------|---------|------------------------------------------|---------------|
| id          | text    | PK                                       | タスクID       |
| title       | text    | NOT NULL                                 | タイトル       |
| description | text    |                                          | 説明           |
| status      | text    | NOT NULL ('todo','in_progress','done')  | ステータス     |
| priority    | text    | NOT NULL ('low','medium','high')        | 優先度         |
| due_date    | date    |                                          | 期限日         |
| project_id  | text    | NOT NULL, FK (projects.id)              | プロジェクトID |
| assignee_id | text    | FK (users.id)                            | 担当者ID       |
| created_at  | timestamp | NOT NULL                               | 作成日時       |

### comments
| カラム名    | データ型 | 制約                    | 説明            |
|------------|---------|-----------------------|----------------|
| id         | text    | PK                    | コメントID      |
| content    | text    | NOT NULL              | 内容            |
| task_id    | text    | NOT NULL, FK (tasks.id)| タスクID        |
| user_id    | text    | NOT NULL, FK (users.id)| ユーザーID      |
| created_at | timestamp | NOT NULL             | 作成日時        |
