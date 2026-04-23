import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  isDragEnabled?: boolean;
}

export function DraggableCard({
  id,
  children,
  isDragEnabled = true
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: !isDragEnabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragEnabled ? 'grab' : 'default'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`slotcity-draggable-card${isDragging ? ' is-dragging' : ''}`}
      {...(isDragEnabled && attributes)}
      {...(isDragEnabled && listeners)}
    >
      {isDragEnabled && (
        <div className="slotcity-card-drag-handle" title="Перетягніть для переміщення">
          ⋮⋮
        </div>
      )}
      {children}
    </div>
  );
}
