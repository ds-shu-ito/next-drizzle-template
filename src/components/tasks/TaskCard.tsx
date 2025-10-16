'use client';

import { useState } from 'react';

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

interface TaskCardProps {
  task: Task;
  userRole: 'editor' | 'viewer';
  onUpdate: () => void;
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

export default function TaskCard({ task, userRole, onUpdate }: TaskCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'done') => {
    if (userRole !== 'editor') return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
          isOverdue ? 'border-l-4 border-red-500' : ''
        }`}
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            {task.assignee ? (
              <span>{task.assignee.name || task.assignee.email}</span>
            ) : (
              <span className="text-gray-400">未割り当て</span>
            )}
          </div>
          {task.due_date && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {new Date(task.due_date).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>

        {userRole === 'editor' && (
          <div className="mt-3 flex space-x-2">
            {task.status !== 'todo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('todo');
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                To Do
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('in_progress');
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                In Progress
              </button>
            )}
            {task.status !== 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('done');
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>

      {/* タスク詳細モーダルは今後実装 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">タスク詳細</h3>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <p>ステータス: {task.status}</p>
                  <p>優先度: {priorityConfig[task.priority].label}</p>
                  {task.assignee && (
                    <p>担当者: {task.assignee.name || task.assignee.email}</p>
                  )}
                  {task.due_date && (
                    <p>期限: {new Date(task.due_date).toLocaleDateString('ja-JP')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
