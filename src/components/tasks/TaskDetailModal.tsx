'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface ProjectMember {
  user_id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'editor' | 'viewer';
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
  userRole: 'editor' | 'viewer';
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
}

const priorityConfig = {
  low: {
    color: 'bg-green-100 text-green-800',
    label: '低',
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800',
    label: '中',
  },
  high: {
    color: 'bg-red-100 text-red-800',
    label: '高',
  },
};

const statusConfig = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
};

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectId,
  userRole,
  onTaskUpdate,
  onTaskDelete,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // 編集用の状態
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assigneeId: '',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
  });

  // プロジェクト参加者を取得
  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  // タスクデータを編集用状態に設定
  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        assigneeId: task.assignee?.id || '',
        status: task.status,
      });
    }
  }, [task]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members);
      } else {
        console.error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          priority: editData.priority,
          dueDate: editData.dueDate || null,
          assigneeId: editData.assigneeId || null,
          status: editData.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
        onTaskUpdate();
      } else {
        setError(data.error || 'タスクの更新に失敗しました');
      }
    } catch (error) {
      console.error('Update task error:', error);
      setError('タスクの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    if (!confirm('このタスクを削除してもよろしいですか？')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose();
        onTaskDelete();
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      setError('タスクの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsEditing(false);
      setError('');
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">タスク詳細</h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 通常モード時の編集・削除ボタン */}
          {userRole === 'editor' && !isEditing && (
            <>
              <hr className="border-gray-200 mb-4" />
              <div className="flex justify-end items-center mb-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編集
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    削除
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                />
              ) : (
                <p className="text-gray-900 font-medium">{task.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  disabled={loading}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                />
              ) : (
                <p className="text-gray-600">{task.description || '説明なし'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="todo">未着手</option>
                    <option value="in_progress">進行中</option>
                    <option value="done">完了</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{statusConfig[task.status]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                </label>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期限
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  />
                ) : (
                  <p className="text-gray-900">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '期限なし'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者
                </label>
                {isEditing ? (
                  <select
                    value={editData.assigneeId}
                    onChange={(e) => setEditData({ ...editData, assigneeId: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="">未割り当て</option>
                    {members.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {task.assignee ? (task.assignee.name || task.assignee.email) : '未割り当て'}
                  </p>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              作成日: {new Date(task.created_at).toLocaleDateString('ja-JP')}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !editData.title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
