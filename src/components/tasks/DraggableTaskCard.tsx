'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskDetailModal from './TaskDetailModal';

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

interface DraggableTaskCardProps {
  task: Task;
  userRole: 'editor' | 'viewer';
  onUpdate: () => void;
  projectId: string;
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
  todo: {
    color: 'bg-gray-100 text-gray-800',
    label: '未着手',
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800',
    label: '進行中',
  },
  done: {
    color: 'bg-green-100 text-green-800',
    label: '完了',
  },
};

export default function DraggableTaskCard({ task, userRole, onUpdate, projectId }: DraggableTaskCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
          isOverdue ? 'border-l-4 border-red-500' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => setIsDetailModalOpen(true)}
        {...attributes}
        {...listeners}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
        </div>

        {/* 現在のステータス表示 */}
        <div className="mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[task.status].color}`}>
            {statusConfig[task.status].label}
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
          <div className="mt-3 flex flex-wrap gap-2">
            {task.status !== 'todo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('todo');
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
              >
                <span>←</span>
                <span>未着手へ</span>
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('in_progress');
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
              >
                <span>{task.status === 'todo' ? '→' : '←'}</span>
                <span>進行中へ</span>
              </button>
            )}
            {task.status !== 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('done');
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
              >
                <span>→</span>
                <span>完了へ</span>
              </button>
            )}
          </div>
        )}

        {/* ドラッグハンドル */}
        <div className="mt-2 flex justify-center">
          <div className="w-6 h-1 bg-gray-300 rounded cursor-grab active:cursor-grabbing">
            <div className="w-full h-full bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={task}
        projectId={projectId}
        userRole={userRole}
        onTaskUpdate={onUpdate}
        onTaskDelete={onUpdate}
      />
    </>
  );
}
