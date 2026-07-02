import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getProposalByIdApi } from "@/api/proposal.api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TRLBadge } from "@/components/shared/TRLBadge";
import AssignReviewerModal from "@/components/reviews/AssignReviewerModal";
import type { Proposal } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminProposalReviewCardProps {
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

const AdminProposalReviewCard = ({ proposal }: AdminProposalReviewCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: fullProposal, isLoading } = useQuery({
    queryKey: ["proposal", proposal.id],
    queryFn: () => getProposalByIdApi(proposal.id),
    staleTime: 0,
  });

  const reviews     = fullProposal?.reviews     ?? [];
  const assignments = fullProposal?.assignments ?? proposal.assignments ?? [];

  return (
    <>
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

<div className="flex items-center gap-4 mt-2">
  {proposal.applicant && (
    <div className="flex items-center gap-1.5">
      <div className="size-5 rounded-full bg-muted flex items-center justify-center">
        <span className="text-[10px] font-semibold text-muted-foreground">
          {proposal.applicant.name[0].toUpperCase()}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {proposal.applicant.name}
      </span>
      {proposal.applicant.organization && (
        <span className="text-xs text-muted-foreground">
          · {proposal.applicant.organization}
        </span>
      )}
    </div>
  )}

  <span className="text-xs text-muted-foreground">
  ₹{(proposal.fundingAmount / 10000000).toFixed(2)} Cr funding
</span>

  <span className="text-xs text-muted-foreground">
    Submitted {new Date(proposal.submittedAt ?? proposal.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}
  </span>
</div>



              <div className="flex flex-wrap gap-2 mt-3">
                <TRLBadge level={proposal.trlLevel} />
                <StatusBadge status={proposal.status} />
              </div>
            </div>

            {/* Right: assign button */}
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => setModalOpen(true)}
            >
              Assign reviewer
            </Button>

          </div>
        </CardContent>

        {/* Divider */}
        <div className="mx-6 border-t border-dashed" />

        {/* Assigned reviewers */}
        <CardContent className="px-6 pt-4 pb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Assigned reviewers
          </p>

          {isLoading ? (
            <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No reviewers assigned yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignments.map((a) => (
                <div
                  key={a.reviewerId}
                  className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1"
                >
                  <div className="size-5 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-orange-700">
                      {a.reviewer.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium">{a.reviewer.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Divider */}
        <div className="mx-6 border-t border-dashed mt-3" />

        {/* Reviews submitted */}
        {/* Reviews grouped by milestone */}
<CardContent className="px-6 pt-4 pb-5">
  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
    Reviews by milestone
  </p>

  {isLoading ? (
    <div className="flex flex-col gap-2">
      {[1, 2].map((i) => (
        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  ) : (fullProposal?.milestones ?? []).length === 0 ? (
    <p className="text-sm text-muted-foreground italic">
      No milestones found.
    </p>
  ) : (
    <div className="flex flex-col gap-4">
      {(fullProposal?.milestones ?? []).map((milestone) => {
        const milestoneReviews = reviews.filter(
          (r) => r.milestoneId === milestone.id
        );

        return (
          <div key={milestone.id} className="flex flex-col gap-2">
            {/* Milestone header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {milestone.title}
              </span>
              <div className="flex-1 border-t border-dashed" />
              <span className="text-xs text-muted-foreground shrink-0">
                {milestoneReviews.length} review{milestoneReviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            {milestoneReviews.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-1">
                No review submitted yet.
              </p>
            ) : (
              milestoneReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
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
                            day: "numeric", month: "short", year: "numeric",
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
              ))
            )}
          </div>
        );
      })}
    </div>
  )}
</CardContent>
      </Card>

      {/* Assign reviewer modal */}
      <AssignReviewerModal
        proposal={fullProposal ?? proposal}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default AdminProposalReviewCard;