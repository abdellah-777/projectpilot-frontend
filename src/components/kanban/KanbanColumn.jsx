import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const columnStyles = {
  todo:        { label: 'To Do',       dot: 'bg-gray-400' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500' },
  review:      { label: 'Review',      dot: 'bg-yellow-500' },
  done:        { label: 'Done',        dot: 'bg-green-500' },
}

export default function KanbanColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const style = columnStyles[column.id]

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className="text-sm font-medium text-gray-700">{style.label}</span>
        <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div
        ref={setNodeRef}
        className={`
          min-h-96 rounded-xl p-2 space-y-2 transition
          ${isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-gray-50'}
        `}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-300">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}