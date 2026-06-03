import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FolderKanban, Sparkles, ArrowRight, Trash2, X } from 'lucide-react'
import Layout from '../../components/ui/Layout'
import { projectsAPI } from '../../api/projects.api'
import toast from 'react-hot-toast'

export default function ProjectsListPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name:           '',
    description:    '',
    original_idea:  '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => projectsAPI.getAll(),
  })

  const projects = data?.data?.data ?? []

  const createProject = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setShowModal(false)
      setForm({ name: '', description: '', original_idea: '' })
      toast.success('Project created!')
    },
    onError: () => toast.error('Failed to create project'),
  })

  const deleteProject = useMutation({
    mutationFn: (id) => projectsAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete project'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createProject.mutate(form)
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">{projects.length} projects total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No projects yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                  {project.name[0].toUpperCase()}
                </div>
                <button
                  onClick={() => deleteProject.mutate(project.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                {project.description || 'No description'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{project.tasks_count} tasks</span>
                  <span>{project.members_count} members</span>
                </div>
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${project.status === 'active'    ? 'bg-green-50 text-green-600' : ''}
                  ${project.status === 'planning'  ? 'bg-blue-50 text-blue-600' : ''}
                  ${project.status === 'on_hold'   ? 'bg-yellow-50 text-yellow-600' : ''}
                  ${project.status === 'completed' ? 'bg-gray-50 text-gray-500' : ''}
                `}>
                  {project.status}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 text-center text-xs text-gray-500 hover:text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  Overview
                </Link>
                <Link
                  to={`/projects/${project.id}/board`}
                  className="flex-1 text-center text-xs text-gray-500 hover:text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  Board
                </Link>
                <Link
                  to={`/projects/${project.id}/ai`}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-purple-500 hover:text-purple-700 py-1.5 rounded-lg hover:bg-purple-50 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="E-Commerce App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Brief project description"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Idea{' '}
                  <span className="text-purple-500 font-normal">(for AI generation)</span>
                </label>
                <textarea
                  value={form.original_idea}
                  onChange={(e) => setForm({ ...form, original_idea: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Describe your project idea in detail... AI will generate the full structure"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}