'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import DraggableTaskCard from './DraggableTaskCard';
import DropZone from './DropZone';

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
    title: '未着手',
    color: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  in_progress: {
    title: '進行中',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  done: {
    title: '完了',
    color: 'bg-green-100',
    textColor: 'text-green-800',
  },
};

export default function KanbanBoard({ tasks, projectId, userRole, onTaskUpdate }: KanbanBoardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const handleCreateTask = (status: 'todo' | 'in_progress' | 'done') => {
    setSelectedStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !activeTask) return;

    // over.idがステータスかタスクIDかを判定
    let newStatus: 'todo' | 'in_progress' | 'done';
    
    if (over.id === 'todo' || over.id === 'in_progress' || over.id === 'done') {
      // 直接ステータスにドロップされた場合
      newStatus = over.id;
    } else {
      // 他のタスクにドロップされた場合、そのタスクのステータスを取得
      const targetTask = tasks.find(task => task.id === over.id);
      if (!targetTask) return; // タスクが見つからない場合は何もしない
      newStatus = targetTask.status;
    }
    
    // ステータスが変更されていない場合は何もしない
    if (activeTask.status === newStatus) return;

    // 編集権限がない場合は何もしない
    if (userRole !== 'editor') return;

    try {
      const response = await fetch(`/api/tasks/${activeTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onTaskUpdate();
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

              <DropZone
                id={status}
                className="space-y-3 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-transparent hover:border-gray-300 transition-colors"
              >
                <SortableContext
                  items={tasksByStatus[status as keyof typeof tasksByStatus].map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasksByStatus[status as keyof typeof tasksByStatus].map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      userRole={userRole}
                      onUpdate={onTaskUpdate}
                      projectId={projectId}
                    />
                  ))}
                </SortableContext>

                {userRole === 'editor' && (
                  <button
                    onClick={() => handleCreateTask(status as 'todo' | 'in_progress' | 'done')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + タスクを追加
                  </button>
                )}
              </DropZone>
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

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white rounded-lg shadow-lg p-4 opacity-90 rotate-3 transform">
            <h4 className="font-medium text-gray-900">{activeTask.title}</h4>
            {activeTask.description && (
              <p className="text-sm text-gray-600 mt-1">{activeTask.description}</p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
