'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="2" height="2" rx="1" />
      <rect x="7" y="3" width="2" height="2" rx="1" />
      <rect x="3" y="7" width="2" height="2" rx="1" />
      <rect x="7" y="7" width="2" height="2" rx="1" />
      <rect x="3" y="11" width="2" height="2" rx="1" />
      <rect x="7" y="11" width="2" height="2" rx="1" />
    </svg>
  )
}

interface SortableRowProps {
  id: string
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode
}

export function SortableRow({ id, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </tr>
  )
}
