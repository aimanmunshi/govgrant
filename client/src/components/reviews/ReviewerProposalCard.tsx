import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProposalByIdApi } from "@/api/proposal.api";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TRLBadge } from "@/components/shared/TRLBadge";
import type { Proposal } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewerProposalCardProps {
  proposal: Proposal;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 8 ? "bg-green-100 text-green-800" :
    score >= 5 ? "bg-amber-100 text-amber-800" :
                 "bg-red-100 text-red-800";

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {score} / 10
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ReviewerProposalCard = ({ proposal }: ReviewerProposalCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: fullProposal, isLoading } = useQuery({
    queryKey: ["proposal", proposal.id],
    queryFn: () => getProposalByIdApi(proposal.id),
    staleTime: 1000 * 60 * 2,
  });

  // Check if this reviewer has already submitted a review
  const myReview = fullProposal?.reviews?.find(
    (r) => r.reviewerId === user?.id
  );
  const hasReviewed = !!myReview;

  return (
    <Card className="overflow-hidden">
      {/* Proposal header */}
      <CardContent className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">

          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold truncate">
              {proposal.title}
            </h2>

            <p className="text-sm text-muted-foreground mt-0.5">
              {proposal.domain}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <TRLBadge level={proposal.trlLevel} />
              <StatusBadge status={proposal.status} />
            </div>
          </div>

          {/* Right: review status indicator */}
          <div className="shrink-0 text-right">
            {isLoading ? (
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            ) : hasReviewed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-green-600" />
                Reviewed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Pending
              </span>
            )}
          </div>

        </div>
      </CardContent>

      {/* Divider */}
      <div className="mx-6 border-t border-dashed" />

      {/* Bottom: review content or CTA */}
      <CardContent className="px-6 pt-4 pb-5">
        {isLoading ? (
          <div className="h-10 rounded-lg bg-muted animate-pulse" />
        ) : hasReviewed && myReview ? (
          // Already reviewed — show summary + edit option
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <ScoreBadge score={myReview.score} />
                <span className="text-xs text-muted-foreground">
                  Submitted{" "}
                  {new Date(myReview.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {myReview.comments && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {myReview.comments}
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => navigate(`/proposals/${proposal.id}/review`)}
            >
              Edit review
            </Button>
          </div>
        ) : (
          // Not reviewed yet — show CTA
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              No review submitted yet.
            </p>

            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 shrink-0"
              onClick={() => navigate(`/proposals/${proposal.id}/review`)}
            >
              Submit review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewerProposalCard;