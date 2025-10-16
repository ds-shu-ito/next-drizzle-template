import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/db';
import { projects, projectsUsers, tasks, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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

    const { projectId } = await params;

    // プロジェクトの存在確認とユーザーの参加確認
    const projectMembership = await db
      .select({
        project: projects,
        role: projectsUsers.role,
      })
      .from(projects)
      .innerJoin(projectsUsers, eq(projects.id, projectsUsers.project_id))
      .where(
        and(
          eq(projects.id, projectId),
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

    const { project, role } = projectMembership[0];

    // プロジェクトのタスク一覧を取得（担当者情報も含む）
    const projectTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        created_at: tasks.created_at,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignee_id, users.id))
      .where(eq(tasks.project_id, projectId))
      .orderBy(tasks.created_at);

    return NextResponse.json({
      project: {
        ...project,
        role,
      },
      tasks: projectTasks,
    });
  } catch (error) {
    console.error('Project detail API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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

    const { projectId } = await params;
    const { name, description } = await request.json();

    // バリデーション
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'プロジェクト名は必須です' },
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
        { error: 'プロジェクトを編集する権限がありません' },
        { status: 403 }
      );
    }

    // プロジェクトを更新
    await db
      .update(projects)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(projects.id, projectId));

    return NextResponse.json({
      message: 'プロジェクトが更新されました',
    });
  } catch (error) {
    console.error('Update project API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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

    const { projectId } = await params;

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
        { error: 'プロジェクトを削除する権限がありません' },
        { status: 403 }
      );
    }

    // プロジェクトを削除（関連するタスクやコメントも自動削除される）
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({
      message: 'プロジェクトが削除されました',
    });
  } catch (error) {
    console.error('Delete project API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
