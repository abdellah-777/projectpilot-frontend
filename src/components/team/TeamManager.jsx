import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Trash2, Mail, Clock, X } from 'lucide-react'
import { projectsAPI } from '../../api/projects.api'
import toast from 'react-hot-toast'

const roleColors = {
  owner:     'bg-purple-50 text-purple-600',
  manager:   'bg-blue-50 text-blue-600',
  developer: 'bg-green-50 text-green-600',
  viewer:    'bg-gray-50 text-gray-500',
}

const statusColors = {
  pending:  'bg-yellow-50 text-yellow-600',
  accepted: 'bg-green-50 text-green-600',
  declined: 'bg-red-50 text-red-500',
  expired:  'bg-gray-50 text-gray-400',
}

export default function TeamManager({ projectId }) {
  const qc = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [tab, setTab]               = useState('members')
  const [form, setForm]             = useState({ email: '', role: 'developer' })

  // Members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['members', projectId],
    queryFn:  () => projectsAPI.getMembers(projectId),
  })

  // Invitations
  const { data: invitationsData, isLoading: loadingInvitations } = useQuery({
    queryKey: ['invitations', projectId],
    queryFn:  () => projectsAPI.getInvitations(projectId),
    enabled:  tab === 'invitations',
  })

  const members     = membersData?.data?.data ?? []
  const invitations = invitationsData?.data?.data ?? []

  // Invite
  const invite = useMutation({
    mutationFn: (data) => projectsAPI.invite(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', projectId] })
      setShowInvite(false)
      setForm({ email: '', role: 'developer' })
      toast.success('Invitation sent successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to send invitation')
    },
  })

  // Remove Member
  const removeMember = useMutation({
    mutationFn: (userId) => projectsAPI.removeMember(projectId, { user_id: userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', projectId] })
      toast.success('Member removed')
    },
    onError: () => toast.error('Failed to remove member'),
  })

  // Update Role
  const updateRole = useMutation({
    mutationFn: (data) => projectsAPI.updateMemberRole(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', projectId] })
      toast.success('Role updated!')
    },
    onError: () => toast.error('Failed to update role'),
  })

  // Cancel Invitation
  const cancelInvitation = useMutation({
    mutationFn: (invId) => projectsAPI.cancelInvitation(projectId, invId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', projectId] })
      toast.success('Invitation cancelled')
    },
    onError: () => toast.error('Failed to cancel invitation'),
  })

  const handleInvite = (e) => {
    e.preventDefault()
    invite.mutate(form)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">Team</h2>
          <p className="text-sm text-gray-400">{members.length} members</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('members')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            tab === 'members'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setTab('invitations')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            tab === 'invitations'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Invitations
        </button>
      </div>

      {/* Members Tab */}
      {tab === 'members' && (
        <>
          {loadingMembers ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No members yet</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
                    {member.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>

                  {member.role === 'owner' ? (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors.owner}`}>
                      owner
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) => updateRole.mutate({
                        user_id: member.id,
                        role:    e.target.value,
                      })}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer ${roleColors[member.role]}`}
                    >
                      <option value="manager">manager</option>
                      <option value="developer">developer</option>
                      <option value="viewer">viewer</option>
                    </select>
                  )}

                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember.mutate(member.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invitations Tab */}
      {tab === 'invitations' && (
        <>
          {loadingInvitations ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              No invitations sent yet
            </div>
          ) : (
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[inv.role]}`}>
                        {inv.role}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[inv.status]}`}>
                    {inv.status}
                  </span>

                  {inv.status === 'pending' && (
                    <button
                      onClick={() => cancelInvitation.mutate(inv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Invite Member</h2>
              <button
                onClick={() => setShowInvite(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="manager">Manager — Can manage project and team</option>
                  <option value="developer">Developer — Can manage tasks</option>
                  <option value="viewer">Viewer — Read only</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  An invitation email will be sent. The link expires in 7 days.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invite.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {invite.isPending ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}