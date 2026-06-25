import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposalByIdApi, updateProposalStatusApi } from '@/api/proposal.api'
import { useAuth } from '@/context/AuthContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TRLBadge } from '@/components/shared/TRLBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Building, Calendar, DollarSign, Layers, User } from 'lucide-react'
import { ProposalStatus } from '@/types'

const statusFlow: ProposalStatus[] = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FUNDED'
]

const nextStatusOptions: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['FUNDED'],
  REJECTED: [],
  FUNDED: [],
}

const ProposalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => getProposalByIdApi(parseInt(id!)),
  })

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: (status: ProposalStatus) =>
      updateProposalStatusApi(parseInt(id!), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Crores`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakhs`
    return `₹${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading proposal...</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Proposal not found</p>
      </div>
    )
  }

  const availableNextStatuses = nextStatusOptions[proposal.status] ?? []

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">

      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/proposals')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            <StatusBadge status={proposal.status} />
            <TRLBadge level={proposal.trlLevel} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Submitted by {proposal.applicant?.name} · {proposal.applicant?.organization}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Main content */}
        <div className="md:col-span-2 flex flex-col gap-4">

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </p>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Milestones ({proposal.milestones?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposal.milestones?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No milestones added yet
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {proposal.milestones?.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex size-7 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{milestone.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            milestone.status === 'COMPLETED'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : milestone.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : milestone.status === 'OVERDUE'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-orange-400 font-medium">
                            Fund Release: {formatCurrency(milestone.fundRelease)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Reviews ({proposal.reviews?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposal.reviews?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews submitted yet
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {proposal.reviews?.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {review.reviewer?.name}
                        </span>
                        <span className="text-lg font-bold text-orange-400">
                          {review.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {review.comments}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">

          {/* Proposal info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proposal Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Funding Requested</p>
                  <p className="text-sm font-medium text-orange-400">
                    {formatCurrency(proposal.fundingAmount)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Domain</p>
                  <p className="text-sm font-medium">{proposal.domain}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Applicant</p>
                  <p className="text-sm font-medium">{proposal.applicant?.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium">
                    {proposal.applicant?.organization ?? 'N/A'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium">
                    {proposal.submittedAt
                      ? new Date(proposal.submittedAt).toLocaleDateString()
                      : 'Not submitted yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin status controls */}
          {user?.role === 'ADMIN' && availableNextStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {availableNextStatuses.map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => changeStatus(status)}
                    className={`w-full justify-start ${
                      status === 'REJECTED'
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : status === 'APPROVED' || status === 'FUNDED'
                        ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                    }`}
                  >
                    Move to {status.replace('_', ' ')}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProposalDetail