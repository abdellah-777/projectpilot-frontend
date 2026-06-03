import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FolderKanban, CheckSquare, Sparkles, ArrowRight } from 'lucide-react'
import Layout from '../../components/ui/Layout'
import { projectsAPI } from '../../api/projects.api'
import useAuthStore from '../../stores/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => projectsAPI.getAll(),
  })

  const projects = data?.data?.data ?? []

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-sm text-gray-500">Total Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Active Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {projects.reduce((acc, p) => acc + (p.tasks_count ?? 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-3">No projects yet</p>
            <Link
              to="/projects"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium text-sm">
                    {project.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-400">{project.tasks_count} tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${project.status === 'active'    ? 'bg-green-50 text-green-600' : ''}
                    ${project.status === 'planning'  ? 'bg-blue-50 text-blue-600' : ''}
                    ${project.status === 'on_hold'   ? 'bg-yellow-50 text-yellow-600' : ''}
                    ${project.status === 'completed' ? 'bg-gray-50 text-gray-600' : ''}
                  `}>
                    {project.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}