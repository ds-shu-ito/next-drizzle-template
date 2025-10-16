'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

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

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  userRole: 'editor' | 'viewer';
  onTaskUpdate: () => void;
}

const statusConfig = {
  todo: {
    title: 'To Do',
    color: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  in_progress: {
    title: 'In Progress',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  done: {
    title: 'Done',
    color: 'bg-green-100',
    textColor: 'text-green-800',
  },
};

export default function KanbanBoard({ tasks, projectId, userRole, onTaskUpdate }: KanbanBoardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const handleCreateTask = (status: 'todo' | 'in_progress' | 'done') => {
    setSelectedStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">タスク管理</h2>
        {userRole === 'editor' && (
          <button
            onClick={() => handleCreateTask('todo')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            新規タスク作成
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="space-y-4">
            <div className={`${config.color} ${config.textColor} px-4 py-2 rounded-lg`}>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{config.title}</h3>
                <span className="text-sm">
                  {tasksByStatus[status as keyof typeof tasksByStatus].length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {tasksByStatus[status as keyof typeof tasksByStatus].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userRole={userRole}
                  onUpdate={onTaskUpdate}
                />
              ))}

              {userRole === 'editor' && (
                <button
                  onClick={() => handleCreateTask(status as 'todo' | 'in_progress' | 'done')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + タスクを追加
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        initialStatus={selectedStatus}
        onTaskCreated={onTaskUpdate}
      />
    </div>
  );
}
