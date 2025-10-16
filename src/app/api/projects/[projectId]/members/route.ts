import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/db';
import { projects, projectsUsers, users } from '@/db/schema';
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

    // プロジェクトの参加者一覧を取得
    const projectMembers = await db
      .select({
        user_id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: projectsUsers.role,
      })
      .from(projectsUsers)
      .innerJoin(users, eq(projectsUsers.user_id, users.id))
      .where(eq(projectsUsers.project_id, projectId))
      .orderBy(users.name);

    return NextResponse.json({ members: projectMembers });
  } catch (error) {
    console.error('Project members API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
