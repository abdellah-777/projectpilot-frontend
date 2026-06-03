import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Kanban, Sparkles, ArrowLeft, Users, CheckSquare, Calendar } from 'lucide-react'
import Layout from '../../components/ui/Layout'
import { projectsAPI } from '../../api/projects.api'
import { tasksAPI } from '../../api/tasks.api'
import TeamManager from '../../components/team/TeamManager'

export default function ProjectDetailPage() {
  const { id } = useParams()

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn:  () => projectsAPI.getOne(id),
  })

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', id],
    queryFn:  () => tasksAPI.getAll(id),
  })

  const project = projectData?.data?.data
  const tasks   = tasksData?.data?.data ?? []

  const todoCount       = tasks.filter(t => t.status === 'todo').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const reviewCount     = tasks.filter(t => t.status === 'review').length
  const doneCount       = tasks.filter(t => t.status === 'done').length

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-16 text-gray-400">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Back */}
      <Link
        to="/projects"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-5 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
          <p className="text-gray-500 mt-1">{project?.description}</p>
        </div>
        <span className={`
          text-xs px-3 py-1.5 rounded-full font-medium
          ${project?.status === 'active'   ? 'bg-green-50 text-green-600' : ''}
          ${project?.status === 'planning' ? 'bg-blue-50 text-blue-600' : ''}
        `}>
          {project?.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Todo',        count: todoCount,       color: 'bg-gray-50 text-gray-600' },
          { label: 'In Progress', count: inProgressCount, color: 'bg-blue-50 text-blue-600' },
          { label: 'Review',      count: reviewCount,     color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Done',        count: doneCount,       color: 'bg-green-50 text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={`/projects/${id}/board`}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition group"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Kanban className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Kanban Board</h3>
          <p className="text-sm text-gray-400">Manage tasks with drag & drop</p>
        </Link>

        <Link
          to={`/projects/${id}/ai`}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition group"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">AI Studio</h3>
          <p className="text-sm text-gray-400">Generate structure, SRS, reports</p>
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Team</h3>
          <p className="text-sm text-gray-400">{project?.members_count} members</p>
        </div>
      </div>
      {/* Team */}
      <div className="mt-6">
        <TeamManager projectId={id} />
      </div>
    </Layout>
  )
}