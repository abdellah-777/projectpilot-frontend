import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { tasksAPI } from '../../api/tasks.api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo' },
  { id: 'in_progress' },
  { id: 'review' },
  { id: 'done' },
]

export default function KanbanBoard({ tasks, projectId }) {
  const qc = useQueryClient()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const moveTask = useMutation({
    mutationFn: ({ taskId, status }) =>
      tasksAPI.move(projectId, taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: () => toast.error('Failed to move task'),
  })

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id)
    return acc
  }, {})

  const handleDragStart = ({ active }) => {
    setActiveTask(active.data.current?.task)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const newStatus   = over.id
    const currentTask = active.data.current?.task

    if (!currentTask || currentTask.status === newStatus) return

    moveTask.mutate({ taskId: currentTask.id, status: newStatus })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasksByStatus[col.id] ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}