'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DropZoneProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function DropZone({ id, children, className = '' }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? 'bg-blue-50 border-blue-300' : ''
      } transition-colors`}
    >
      {children}
    </div>
  );
}
