import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sparkles, ArrowLeft, Wand2, FileText,
  AlertTriangle, BarChart2, MessageSquare, Send, Loader2
} from 'lucide-react'
import Layout from '../../components/ui/Layout'
import { projectsAPI } from '../../api/projects.api'
import { aiAPI } from '../../api/ai.api'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'pm',      label: 'AI PM',        icon: Wand2,         desc: 'Generate full project structure' },
  { id: 'ba',      label: 'AI Analyst',   icon: FileText,      desc: 'Generate SRS document' },
  { id: 'risk',    label: 'Risk AI',      icon: AlertTriangle, desc: 'Analyze project risks' },
  { id: 'report',  label: 'Reports',      icon: BarChart2,     desc: 'Generate sprint reports' },
  { id: 'meeting', label: 'Meeting AI',   icon: MessageSquare, desc: 'Convert notes to tasks' },
]

export default function AIStudioPage() {
  const { id } = useParams()
  const qc     = useQueryClient()

  const [activeTab, setActiveTab]   = useState('pm')
  const [result, setResult]         = useState(null)
  const [meetingNotes, setMeetingNotes] = useState('')
  const [question, setQuestion]     = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const { data: projectData } = useQuery({
    queryKey: ['project', id],
    queryFn:  () => projectsAPI.getOne(id),
  })

  const project = projectData?.data?.data

  // AI PM — Generate Structure
  const generateStructure = useMutation({
    mutationFn: () => aiAPI.generateStructure(id),
    onSuccess: (res) => {
      setResult({ type: 'structure', data: res.data })
      qc.invalidateQueries({ queryKey: ['tasks', id] })
      toast.success('Project structure generated!')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed'),
  })

  // AI BA — Generate SRS
  const generateSRS = useMutation({
    mutationFn: () => aiAPI.generateSRS(id, {}),
    onSuccess: (res) => {
      setResult({ type: 'srs', data: res.data })
      toast.success('SRS document generated!')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed'),
  })

  // AI BA — Ask Question
  const askAnalyst = useMutation({
    mutationFn: (q) => aiAPI.askAnalyst(id, { question: q }),
    onSuccess: (res) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user',      content: question },
        { role: 'assistant', content: res.data.answer },
      ])
      setQuestion('')
    },
    onError: () => toast.error('Failed to get answer'),
  })

  // AI Risk
  const analyzeRisks = useMutation({
    mutationFn: () => aiAPI.analyzeRisks(id),
    onSuccess: (res) => {
      setResult({ type: 'risk', data: res.data })
      toast.success('Risk analysis completed!')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed'),
  })

  // AI Meeting
  const processMeeting = useMutation({
    mutationFn: () => aiAPI.processMeetingNotes(id, { notes: meetingNotes }),
    onSuccess: (res) => {
      setResult({ type: 'meeting', data: res.data })
      qc.invalidateQueries({ queryKey: ['tasks', id] })
      toast.success(`${res.data.tasks_created} tasks created!`)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed'),
  })

  // AI Weekly Report
  const generateReport = useMutation({
    mutationFn: () => aiAPI.weeklyProjectSummary(id),
    onSuccess: (res) => {
      setResult({ type: 'report', data: res.data })
      toast.success('Report generated!')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed'),
  })

  const isLoading =
    generateStructure.isPending ||
    generateSRS.isPending ||
    analyzeRisks.isPending ||
    processMeeting.isPending ||
    generateReport.isPending

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/projects/${id}`}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Studio — {project?.name}
          </h1>
          <p className="text-sm text-gray-400">Powered by GPT-4o</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null) }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition
                ${activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* AI PM */}
          {activeTab === 'pm' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">AI Project Manager</h2>
              <p className="text-sm text-gray-400 mb-6">
                Generate complete project structure (Epics, Stories, Tasks) from your idea
              </p>

              {project?.original_idea && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-400 mb-1">Project idea</p>
                  <p className="text-sm text-gray-600">{project.original_idea}</p>
                </div>
              )}

              <button
                onClick={() => generateStructure.mutate()}
                disabled={generateStructure.isPending}
                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium text-sm"
              >
                {generateStructure.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  : <><Wand2 className="w-4 h-4" /> Generate Structure</>
                }
              </button>

              {result?.type === 'structure' && (
                <div className="mt-6 space-y-3">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-700 mb-1">Summary</p>
                    <p className="text-sm text-purple-600">{result.data.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.data.stats?.epics_created}
                      </p>
                      <p className="text-xs text-gray-400">Epics created</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.data.stats?.timeline}
                      </p>
                      <p className="text-xs text-gray-400">Timeline</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Tasks added to your board!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI BA */}
          {activeTab === 'ba' && (
            <div className="space-y-4">
              {/* Generate SRS */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Generate SRS Document</h2>
                <p className="text-sm text-gray-400 mb-4">
                  AI will write a complete Software Requirements Specification
                </p>
                <button
                  onClick={() => generateSRS.mutate()}
                  disabled={generateSRS.isPending}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm"
                >
                  {generateSRS.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    : <><FileText className="w-4 h-4" /> Generate SRS</>
                  }
                </button>

                {result?.type === 'srs' && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {result.data.artifact?.content}
                    </pre>
                  </div>
                )}
              </div>

              {/* Ask Analyst */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Ask Business Analyst</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Ask questions about requirements, features, or clarifications
                </p>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-xs rounded-lg px-3 py-2 text-sm
                          ${msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'}
                        `}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && question.trim()) {
                        askAnalyst.mutate(question)
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="What features should the admin panel have?"
                  />
                  <button
                    onClick={() => question.trim() && askAnalyst.mutate(question)}
                    disabled={askAnalyst.isPending || !question.trim()}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {askAnalyst.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Risk */}
          {activeTab === 'risk' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">AI Risk Predictor</h2>
              <p className="text-sm text-gray-400 mb-6">
                Analyze your project and predict potential risks and delays
              </p>

              <button
                onClick={() => analyzeRisks.mutate()}
                disabled={analyzeRisks.isPending}
                className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition font-medium text-sm"
              >
                {analyzeRisks.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  : <><AlertTriangle className="w-4 h-4" /> Analyze Risks</>
                }
              </button>

              {result?.type === 'risk' && (
                <div className="mt-6 space-y-4">
                  {/* Overall Risk */}
                  <div className={`
                    rounded-lg p-4
                    ${result.data.data?.overall_risk_level === 'low'      ? 'bg-green-50' : ''}
                    ${result.data.data?.overall_risk_level === 'medium'   ? 'bg-yellow-50' : ''}
                    ${result.data.data?.overall_risk_level === 'high'     ? 'bg-orange-50' : ''}
                    ${result.data.data?.overall_risk_level === 'critical' ? 'bg-red-50' : ''}
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Overall Risk Level</p>
                      <span className={`
                        text-sm font-bold uppercase
                        ${result.data.data?.overall_risk_level === 'low'      ? 'text-green-600' : ''}
                        ${result.data.data?.overall_risk_level === 'medium'   ? 'text-yellow-600' : ''}
                        ${result.data.data?.overall_risk_level === 'high'     ? 'text-orange-600' : ''}
                        ${result.data.data?.overall_risk_level === 'critical' ? 'text-red-600' : ''}
                      `}>
                        {result.data.data?.overall_risk_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Delay probability: {result.data.data?.delay_probability_percent}%
                    </p>
                  </div>

                  {/* Risks List */}
                  <div className="space-y-2">
                    {result.data.data?.risks?.map((risk, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {risk.type}
                          </span>
                          <span className={`
                            text-xs px-2 py-0.5 rounded font-medium
                            ${risk.impact === 'high'   ? 'bg-red-50 text-red-500' : ''}
                            ${risk.impact === 'medium' ? 'bg-yellow-50 text-yellow-500' : ''}
                            ${risk.impact === 'low'    ? 'bg-green-50 text-green-500' : ''}
                          `}>
                            {risk.impact} impact
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{risk.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{risk.mitigation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {result.data.data?.recommendations?.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-700 mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {result.data.data.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-blue-600 flex items-start gap-1.5">
                            <span className="mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Report */}
          {activeTab === 'report' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">AI Report Generator</h2>
              <p className="text-sm text-gray-400 mb-6">
                Generate weekly project summary with insights
              </p>

              <button
                onClick={() => generateReport.mutate()}
                disabled={generateReport.isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium text-sm"
              >
                {generateReport.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  : <><BarChart2 className="w-4 h-4" /> Generate Weekly Report</>
                }
              </button>

              {result?.type === 'report' && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                    {result.data.content}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* AI Meeting */}
          {activeTab === 'meeting' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">AI Meeting Assistant</h2>
              <p className="text-sm text-gray-400 mb-4">
                Paste your meeting notes — AI will extract tasks, decisions, and action items
              </p>

              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-4"
                placeholder="Paste meeting notes here...&#10;&#10;Example:&#10;- We decided to launch the MVP by end of month&#10;- Ahmed will implement the payment gateway by Friday&#10;- Sara needs to finish the UI mockups this week"
                rows={8}
              />

              <button
                onClick={() => processMeeting.mutate()}
                disabled={processMeeting.isPending || !meetingNotes.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm"
              >
                {processMeeting.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><MessageSquare className="w-4 h-4" /> Extract Tasks</>
                }
              </button>

              {result?.type === 'meeting' && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-700">
                      ✅ {result.data.tasks_created} tasks created in your board
                    </p>
                  </div>

                  {result.data.summary && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Summary</p>
                      <p className="text-sm text-gray-600">{result.data.summary}</p>
                    </div>
                  )}

                  {result.data.decisions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Decisions</p>
                      <ul className="space-y-1">
                        {result.data.decisions.map((d, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.data.tasks?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tasks Created</p>
                      <div className="space-y-2">
                        {result.data.tasks.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                            <span className={`
                              text-xs px-1.5 py-0.5 rounded font-medium
                              ${t.priority === 'high'   ? 'bg-orange-50 text-orange-500' : ''}
                              ${t.priority === 'medium' ? 'bg-yellow-50 text-yellow-500' : ''}
                              ${t.priority === 'low'    ? 'bg-gray-100 text-gray-400' : ''}
                            `}>
                              {t.priority}
                            </span>
                            <p className="text-sm text-gray-700">{t.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}