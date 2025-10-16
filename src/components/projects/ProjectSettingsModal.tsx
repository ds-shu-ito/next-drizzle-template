'use client';

import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  role: 'editor' | 'viewer';
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectUpdate: () => void;
  onProjectDelete: () => void;
}

export default function ProjectSettingsModal({
  isOpen,
  onClose,
  project,
  onProjectUpdate,
  onProjectDelete,
}: ProjectSettingsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 編集用の状態
  const [editData, setEditData] = useState({
    name: project.name,
    description: project.description || '',
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
        onProjectUpdate();
      } else {
        setError(data.error || 'プロジェクトの更新に失敗しました');
      }
    } catch (error) {
      console.error('Update project error:', error);
      setError('プロジェクトの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`プロジェクト「${project.name}」を削除してもよろしいですか？\n\nこの操作は取り消せません。プロジェクト内のすべてのタスクとコメントも削除されます。`)) {
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose();
        onProjectDelete();
      } else {
        const data = await response.json();
        setError(data.error || 'プロジェクトの削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      setError('プロジェクトの削除に失敗しました');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !deleteLoading) {
      setIsEditing(false);
      setError('');
      setEditData({
        name: project.name,
        description: project.description || '',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">プロジェクト設定</h3>
            <button
              onClick={handleClose}
              disabled={loading || deleteLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 通常モード時の編集ボタン */}
          {project.role === 'editor' && !isEditing && (
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
                プロジェクト名
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                />
              ) : (
                <p className="text-gray-900 font-medium">{project.name}</p>
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
                <p className="text-gray-600">{project.description || '説明なし'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                あなたの権限
              </label>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  project.role === 'editor'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {project.role === 'editor' ? '編集者' : '閲覧者'}
              </span>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !editData.name.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            )}

            {project.role === 'editor' && !isEditing && (
              <div className="pt-4 border-t">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">危険な操作</h4>
                  <p className="text-sm text-red-700 mb-3">
                    プロジェクトを削除すると、プロジェクト内のすべてのタスクとコメントも削除されます。この操作は取り消せません。
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteLoading ? '削除中...' : 'プロジェクトを削除'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
