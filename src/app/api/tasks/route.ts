import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/db';
import { projects, projectsUsers, tasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { title, description, projectId, assigneeId, priority, dueDate } = await request.json();

    // バリデーション
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'タスクのタイトルは必須です' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'プロジェクトIDは必須です' },
        { status: 400 }
      );
    }

    // プロジェクトの存在確認とユーザーの編集権限確認
    const projectMembership = await db
      .select({
        role: projectsUsers.role,
      })
      .from(projectsUsers)
      .where(
        and(
          eq(projectsUsers.project_id, projectId),
          eq(projectsUsers.user_id, user.id)
        )
      )
      .limit(1);

    if (projectMembership.length === 0) {
      return NextResponse.json(
        { error: 'プロジェクトが見つからないか、アクセス権限がありません' },
        { status: 404 }
      );
    }

    if (projectMembership[0].role !== 'editor') {
      return NextResponse.json(
        { error: 'タスクを作成する権限がありません' },
        { status: 403 }
      );
    }

    // タスクIDを生成
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // タスクを作成
    const newTask = {
      id: taskId,
      title: title.trim(),
      description: description?.trim() || null,
      status: 'todo',
      priority: priority || 'medium',
      due_date: dueDate || null,
      project_id: projectId,
      assignee_id: assigneeId || null,
      created_at: new Date(),
    };

    await db.insert(tasks).values(newTask);

    return NextResponse.json(
      {
        task: newTask,
        message: 'タスクが作成されました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
