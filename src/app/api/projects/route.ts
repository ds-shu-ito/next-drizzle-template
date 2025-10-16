import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/db';
import { projects, projectsUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    // ユーザーが参加しているプロジェクトを取得
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        created_at: projects.created_at,
        role: projectsUsers.role,
      })
      .from(projects)
      .innerJoin(projectsUsers, eq(projects.id, projectsUsers.project_id))
      .where(eq(projectsUsers.user_id, user.id))
      .orderBy(projects.created_at);

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

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

    const { name, description } = await request.json();

    // バリデーション
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'プロジェクト名は必須です' },
        { status: 400 }
      );
    }

    // プロジェクトIDを生成
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // プロジェクトを作成
    const newProject = {
      id: projectId,
      name: name.trim(),
      description: description?.trim() || null,
      created_at: new Date(),
    };

    await db.insert(projects).values(newProject);

    // 作成者をプロジェクトに追加（編集者権限）
    await db.insert(projectsUsers).values({
      user_id: user.id,
      project_id: projectId,
      role: 'editor',
    });

    return NextResponse.json(
      {
        project: {
          ...newProject,
          role: 'editor',
        },
        message: 'プロジェクトが作成されました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
