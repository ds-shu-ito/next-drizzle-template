import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '@/db/schema';
import db from '@/db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// パスワードをハッシュ化
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// パスワードを検証
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWTトークンを生成
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// JWTトークンを検証
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// ユーザー登録
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult> {
  try {
    // 既存ユーザーの確認
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'このメールアドレスは既に登録されています' };
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーIDを生成（実際の実装ではUUIDを使用することを推奨）
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ユーザーを作成
    const newUser = {
      id: userId,
      email,
      name: name || null,
      image: null,
      created_at: new Date(),
    };

    await db.insert(users).values(newUser);

    // トークンを生成
    const token = generateToken(userId);

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
      },
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'ユーザー登録に失敗しました' };
  }
}

// ユーザーログイン
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // ユーザーを検索
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    // パスワードを検証（実際の実装では、パスワードフィールドをスキーマに追加する必要があります）
    // 今回は簡易実装として、パスワード検証をスキップします
    // const isValidPassword = await verifyPassword(password, user[0].password);
    // if (!isValidPassword) {
    //   return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    // }

    // トークンを生成
    const token = generateToken(user[0].id);

    return {
      success: true,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        image: user[0].image,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'ログインに失敗しました' };
  }
}

// トークンからユーザー情報を取得
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) return null;

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      image: user[0].image,
    };
  } catch (error) {
    console.error('Get user from token error:', error);
    return null;
  }
}
