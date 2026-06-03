import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, User, AlertCircle } from 'lucide-react'

const priorityColors = {
  critical: 'bg-red-50 text-red-600',
  high:     'bg-orange-50 text-orange-600',
  medium:   'bg-yellow-50 text-yellow-600',
  low:      'bg-gray-50 text-gray-500',
}

const typeColors = {
  story:   'bg-blue-50 text-blue-600',
  task:    'bg-gray-50 text-gray-600',
  bug:     'bg-red-50 text-red-600',
  subtask: 'bg-purple-50 text-purple-600',
}

export default function TaskCard({ task, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isSortableDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-gray-100 p-3 cursor-grab active:cursor-grabbing
        hover:shadow-sm transition select-none
        ${isDragging ? 'shadow-lg rotate-1' : ''}
      `}
    >
      {/* Type + Priority */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColors[task.type] ?? typeColors.task}`}>
          {task.type}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority] ?? priorityColors.medium}`}>
          {task.priority}
        </span>
        {task.ai_generated && (
          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-500 ml-auto">
            ✨ AI
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </p>

      {/* Blocked */}
      {task.is_blocked && (
        <div className="flex items-center gap-1 text-xs text-red-500 mb-2">
          <AlertCircle className="w-3 h-3" />
          Blocked
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {task.due_date}
            </div>
          )}
          {task.story_points && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {task.story_points} pts
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
            {task.assignee.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}