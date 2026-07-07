import { useEffect, useState } from 'react'
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
import { StatusBadge } from '@/components/shared/StatusBadge'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) => {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2)} L`
  return `₹${amount.toLocaleString()}`
}

// ─── Main component ───────────────────────────────────────────────────────────

const SubmitReview = () => {
  const { id } = useParams()
  const proposalId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

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

  // Has this reviewer already reviewed this proposal?
  const myReview = reviewData?.reviews.find((r) => r.reviewerId === user?.id)
  const hasReviewed = !!myReview

  // Prefill the form when an existing review is loaded
  useEffect(() => {
    if (myReview) {
      setScore(myReview.score)
      setComments(myReview.comments)
    }
  }, [myReview])

  const canReview = proposal?.status === 'UNDER_REVIEW'

  const { mutate, isPending } = useMutation({
    mutationFn: () => submitReviewApi(proposalId, { score, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit review')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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
            Evaluate this proposal on technical merit, feasibility, and impact
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
              <StatusBadge status={proposal.status} />
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {proposal.description}
            </p>
            <p className="text-xs text-orange-400 font-medium mt-2">
              Requested: {formatCurrency(proposal.fundingAmount)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Not under review — reviews are locked */}
      {proposal && !canReview && !hasReviewed && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            This proposal is not open for review.
            <br />
            Reviews can only be submitted while a proposal is under review.
          </CardContent>
        </Card>
      )}

      {/* Already reviewed */}
      {hasReviewed && (
        <Card>
          <CardContent className="py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              You submitted a review with a score of {myReview!.score}/100.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Review form */}
      {(canReview || hasReviewed) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {hasReviewed ? 'Your Review' : 'Your Evaluation'}
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
                  disabled={hasReviewed}
                  className="w-full accent-orange-500 disabled:opacity-50"
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
                  disabled={hasReviewed}
                  rows={5}
                  className="w-full rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-50"
                />
                {!hasReviewed && (
                  <p className={`text-xs ${comments.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {comments.length}/10 minimum characters
                  </p>
                )}
              </div>

              {/* Actions */}
              {!hasReviewed && (
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
              )}
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default SubmitReview
