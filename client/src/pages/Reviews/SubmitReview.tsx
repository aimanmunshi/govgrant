import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposalByIdApi } from '@/api/proposal.api'
import { submitReviewApi, getReviewsApi } from '@/api/review.api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { TRLBadge } from '@/components/shared/TRLBadge'

const SubmitReview = () => {
  const { id } = useParams()
  const proposalId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const { mutate, isPending } = useMutation({
    mutationFn: () => submitReviewApi(proposalId, { score, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
      navigate(`/proposals/${proposalId}`)
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

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/proposals/${proposalId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Submit Review</h1>
          <p className="text-muted-foreground text-sm">
            Evaluate this proposal and provide a score
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

      {/* Existing reviews summary */}
      {reviewData && reviewData.totalReviews > 0 && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {reviewData.totalReviews} review{reviewData.totalReviews > 1 ? 's' : ''} submitted so far
            </p>
            <p className="text-sm font-medium text-orange-400">
              Avg: {reviewData.averageScore?.toFixed(0)}/100
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Evaluation</CardTitle>
          <CardDescription>
            Score from 0-100 based on technical merit, feasibility, and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Score</Label>
                <span className="text-lg font-bold text-orange-400">{score}/100</span>
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
    </div>
  )
}

export default SubmitReview