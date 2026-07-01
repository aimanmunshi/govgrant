import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposalByIdApi } from '@/api/proposal.api'
import {
  getMilestonesApi,
  createMilestoneApi,
  updateMilestoneStatusApi,
} from '@/api/milestone.api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { MilestoneStatus } from '@/types'
import { useLocation} from "react-router-dom";

const statusOptions: MilestoneStatus[] = [
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'
]

const statusColor: Record<MilestoneStatus, string> = {
  PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const MilestoneTracker = () => {
  const { id } = useParams()
  const proposalId = Number(id)
  const navigate = useNavigate()
  const location = useLocation();
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    fundRelease: 0,
  })

  const { data: proposal } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => getProposalByIdApi(proposalId),
  })

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', proposalId],
    queryFn: () => getMilestonesApi(proposalId),
  })

  const { mutate: addMilestone, isPending: isAdding } = useMutation({
    mutationFn: () => createMilestoneApi(proposalId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
      setForm({ title: '', description: '', dueDate: '', fundRelease: 0 })
      setShowForm(false)
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to add milestone')
    },
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: number; status: string }) =>
      updateMilestoneStatusApi(milestoneId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: name === 'fundRelease' ? Number(value) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    addMilestone()
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
    return `₹${amount.toLocaleString()}`
  }

  const canAddMilestone =
  user?.role === 'APPLICANT' &&
  proposal?.applicant?.id === user.id &&
  (proposal?.status === 'APPROVED' || proposal?.status === 'FUNDED')

  const canChangeStatus =
  user?.role === 'ADMIN' ||
  user?.role === 'REVIEWER'
  const handleBack = () => {
  const from = location.state?.from;

  if (from === "proposal-detail") {
    navigate(`/proposals/${id}`);
    return;
  }

  navigate("/proposals");
};

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
  {!showForm && (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )}

  <div className="flex-1">
    <h1 className="text-2xl font-bold">Milestones</h1>
    <p className="text-muted-foreground text-sm">
      {proposal?.title ?? 'Loading...'}
    </p>
  </div>

  {canAddMilestone && !showForm && (
    <Button
      onClick={() => setShowForm(true)}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Milestone
    </Button>
  )}
</div>

      {/* Add milestone form */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">New Milestone</CardTitle>
              <CardDescription>Define a deliverable and its fund release amount</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  name="title"
                  placeholder="Prototype Development"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <textarea
                  name="description"
                  placeholder="Describe the deliverable for this milestone..."
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Fund Release (₹)</Label>
                  <Input
                    name="fundRelease"
                    type="number"
                    placeholder="5000000"
                    value={form.fundRelease}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAdding ? 'Adding...' : 'Add Milestone'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Milestone list */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading milestones...</p>
        ) : milestones?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No milestones yet
              {!canAddMilestone && proposal?.status !== 'APPROVED' && proposal?.status !== 'FUNDED' && (
                <p className="mt-1 text-xs">
                  Milestones can only be added once the proposal is approved
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          milestones?.map((milestone, index) => (
            <Card key={milestone.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[milestone.status]}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-orange-400 font-medium">
                        {formatCurrency(milestone.fundRelease)}
                      </span>
                    </div>

                    {canChangeStatus && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {statusOptions
                          .filter((s) => s !== milestone.status)
                          .map((s) => (
                            <Button
                              key={s}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() =>
                                changeStatus({ milestoneId: milestone.id, status: s })
                              }
                            >
                              Mark {s.replace('_', ' ')}
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default MilestoneTracker