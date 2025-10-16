import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/db';
import { tasks, projectsUsers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
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

    const { taskId } = await params;
    const { status, title, description, priority, dueDate, assigneeId } = await request.json();

    // タスクの存在確認とユーザーの編集権限確認
    const taskWithProject = await db
      .select({
        task: tasks,
        userRole: projectsUsers.role,
      })
      .from(tasks)
      .innerJoin(projectsUsers, eq(tasks.project_id, projectsUsers.project_id))
      .where(
        and(
          eq(tasks.id, taskId),
          eq(projectsUsers.user_id, user.id)
        )
      )
      .limit(1);

    if (taskWithProject.length === 0) {
      return NextResponse.json(
        { error: 'タスクが見つからないか、アクセス権限がありません' },
        { status: 404 }
      );
    }

    if (taskWithProject[0].userRole !== 'editor') {
      return NextResponse.json(
        { error: 'タスクを編集する権限がありません' },
        { status: 403 }
      );
    }

    // 更新データを準備
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.due_date = dueDate || null;
    if (assigneeId !== undefined) updateData.assignee_id = assigneeId || null;

    // タスクを更新
    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    return NextResponse.json({
      message: 'タスクが更新されました',
    });
  } catch (error) {
    console.error('Update task API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
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

    const { taskId } = await params;

    // タスクの存在確認とユーザーの編集権限確認
    const taskWithProject = await db
      .select({
        userRole: projectsUsers.role,
      })
      .from(tasks)
      .innerJoin(projectsUsers, eq(tasks.project_id, projectsUsers.project_id))
      .where(
        and(
          eq(tasks.id, taskId),
          eq(projectsUsers.user_id, user.id)
        )
      )
      .limit(1);

    if (taskWithProject.length === 0) {
      return NextResponse.json(
        { error: 'タスクが見つからないか、アクセス権限がありません' },
        { status: 404 }
      );
    }

    if (taskWithProject[0].userRole !== 'editor') {
      return NextResponse.json(
        { error: 'タスクを削除する権限がありません' },
        { status: 403 }
      );
    }

    // タスクを削除
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json({
      message: 'タスクが削除されました',
    });
  } catch (error) {
    console.error('Delete task API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
