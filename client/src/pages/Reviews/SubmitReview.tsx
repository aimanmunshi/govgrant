import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposalByIdApi } from '@/api/proposal.api'
import { submitReviewApi, getReviewsApi } from '@/api/review.api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { TRLBadge } from '@/components/shared/TRLBadge'
import type { Milestone } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) => {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2)} L`
  return `₹${amount.toLocaleString()}`
}

const milestoneStatusColor: Record<string, string> = {
  PENDING:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED:   'bg-green-500/10 text-green-400 border-green-500/20',
  OVERDUE:     'bg-red-500/10 text-red-400 border-red-500/20',
}

// ─── Milestone selector ───────────────────────────────────────────────────────

interface MilestoneSelectorProps {
  milestones: Milestone[]
  reviewedMilestoneIds: Set<number>
  selected: Milestone | null
  onSelect: (m: Milestone) => void
}

const MilestoneSelector = ({
  milestones,
  reviewedMilestoneIds,
  selected,
  onSelect,
}: MilestoneSelectorProps) => (
  <div className="flex flex-col gap-2">
    {milestones.map((milestone, index) => {
      const alreadyReviewed = reviewedMilestoneIds.has(milestone.id)
      const isSelected = selected?.id === milestone.id

      return (
        <button
          key={milestone.id}
          type="button"
          disabled={alreadyReviewed}
          onClick={() => onSelect(milestone)}
          className={`
            flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-left
            transition-all duration-150
            ${alreadyReviewed
              ? 'opacity-50 cursor-not-allowed bg-muted'
              : isSelected
                ? 'border-orange-400 bg-orange-500/5'
                : 'hover:border-orange-300 hover:bg-muted/40'
            }
          `}
        >
          {/* Index */}
          <div className="flex w-6 h-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold shrink-0 mt-0.5">
            {index + 1}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{milestone.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${milestoneStatusColor[milestone.status]}`}>
                  {milestone.status.replace('_', ' ')}
                </span>
                {alreadyReviewed && (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Reviewed
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-muted-foreground">
                Due {new Date(milestone.dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
              <span className="text-xs text-orange-400 font-medium">
                {formatCurrency(milestone.fundRelease)}
              </span>
            </div>
          </div>

          {/* Selection indicator */}
          {!alreadyReviewed && (
            <span className={`w-4 h-4 rounded-full border shrink-0 mt-1 ${
              isSelected ? 'bg-orange-500 border-orange-500' : 'border-muted-foreground/30'
            }`} />
          )}
        </button>
      )
    })}
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

const SubmitReview = () => {
  const { id } = useParams()
  const proposalId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [score, setScore] = useState(70)
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')

  const { data: proposal } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => getProposalByIdApi(proposalId),
  })

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', proposalId],
    queryFn: () => getReviewsApi(proposalId),
  })

  // Milestones this reviewer has already reviewed
  const reviewedMilestoneIds = new Set(
    reviewData?.reviews
      .filter((r: any) => r.reviewerId === user?.id)
      .map((r: any) => r.milestoneId) ?? []
  )

  const milestones = proposal?.milestones ?? []
  const allReviewed = milestones.length > 0 &&
    milestones.every((m) => reviewedMilestoneIds.has(m.id))

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      submitReviewApi(proposalId, {
        milestoneId: selectedMilestone!.id,
        score,
        comments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
      // Reset form for next milestone
      setSelectedMilestone(null)
      setScore(70)
      setComments('')
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit review')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedMilestone) {
      setError('Please select a milestone to review')
      return
    }
    if (comments.trim().length < 10) {
      setError('Comments must be at least 10 characters')
      return
    }
    mutate()
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/proposals/${proposalId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Submit Review</h1>
          <p className="text-muted-foreground text-sm">
            Select a milestone and submit your evaluation
          </p>
        </div>
      </div>

      {/* Proposal summary */}
      {proposal && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <p className="font-medium text-sm">{proposal.title}</p>
              <TRLBadge level={proposal.trlLevel} />
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {proposal.description}
            </p>
            <p className="text-xs text-orange-400 font-medium mt-2">
              Requested: {formatCurrency(proposal.fundingAmount)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review progress */}
      {milestones.length > 0 && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {reviewedMilestoneIds.size} of {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} reviewed
            </p>
            {allReviewed && (
              <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                All milestones reviewed
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* No milestones state */}
      {milestones.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No milestones found for this proposal.
            <br />
            Milestones must be added before reviews can be submitted.
          </CardContent>
        </Card>
      )}

      {/* Milestone selector */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Milestone</CardTitle>
            <CardDescription>
              Choose which milestone you are reviewing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MilestoneSelector
              milestones={milestones}
              reviewedMilestoneIds={reviewedMilestoneIds}
              selected={selectedMilestone}
              onSelect={setSelectedMilestone}
            />
          </CardContent>
        </Card>
      )}

      {/* Review form — only shown when a milestone is selected */}
      {selectedMilestone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Reviewing: {selectedMilestone.title}
            </CardTitle>
            <CardDescription>
              Score from 0–100 based on technical merit, feasibility, and impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Score slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Score</Label>
                  <span className="text-lg font-bold text-orange-400">
                    {score}/100
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Comments */}
              <div className="grid gap-2">
                <Label>Comments</Label>
                <textarea
                  placeholder="Provide detailed feedback on technical feasibility, innovation, and funding justification (minimum 10 characters)..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                  rows={5}
                  className="w-full rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <p className={`text-xs ${comments.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {comments.length}/10 minimum characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/proposals/${proposalId}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default SubmitReview