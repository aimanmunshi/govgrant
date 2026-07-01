import { useQuery } from "@tanstack/react-query";

import { getProposalByIdApi } from "@/api/proposal.api";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Proposal } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProposalReviewCardProps {
  proposal: Proposal;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 8 ? "bg-green-100 text-green-800" :
    score >= 5 ? "bg-amber-100 text-amber-800" :
                 "bg-red-100 text-red-800";

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score} / 10
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProposalReviewCard = ({ proposal }: ProposalReviewCardProps) => {
  const { data: fullProposal, isLoading } = useQuery({
    queryKey: ["proposal", proposal.id],
    queryFn: () => getProposalByIdApi(proposal.id),
    staleTime: 1000 * 60 * 2,
  });

  const reviews = fullProposal?.reviews ?? [];

  return (
    <Card className="overflow-hidden">
      {/* Proposal header */}
      <CardContent className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold truncate">{proposal.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{proposal.domain}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={proposal.status} />
            <span className="text-xs text-muted-foreground">
              {proposal._count?.reviews ?? 0} review{(proposal._count?.reviews ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Divider */}
      <div className="mx-6 border-t border-dashed" />

      {/* Reviews section */}
      <CardContent className="px-6 pt-4 pb-5">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No reviews submitted yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Reviewer info */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-orange-700">
                        {review.reviewer?.name?.[0]?.toUpperCase() ?? "R"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {review.reviewer?.name ?? "Reviewer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <ScoreBadge score={review.score} />
                </div>

                {review.comments && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {review.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalReviewCard;