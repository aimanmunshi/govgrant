import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProposalByIdApi } from "@/api/proposal.api";
import { Card, CardContent } from "@/components/ui/card";
import { TRLBadge } from "@/components/shared/TRLBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Proposal, MilestoneStatus } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProposalMilestoneCardProps {
  proposal: Proposal;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string => {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(1)} L`;
  return `₹${amount.toLocaleString()}`;
};

const milestoneStatusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; dot: string }
> = {
  PENDING:     { label: "Pending",     color: "text-muted-foreground", dot: "bg-muted-foreground" },
  IN_PROGRESS: { label: "In progress", color: "text-blue-600",         dot: "bg-blue-500"         },
  COMPLETED:   { label: "Completed",   color: "text-green-600",        dot: "bg-green-500"        },
  OVERDUE:     { label: "Overdue",     color: "text-red-600",          dot: "bg-red-500"          },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProposalMilestoneCard = ({ proposal }: ProposalMilestoneCardProps) => {
  const navigate = useNavigate();

  // Fetch full proposal to get milestones array
  const { data: fullProposal, isLoading: milestonesLoading } = useQuery({
    queryKey: ["proposal", proposal.id],
    queryFn: () => getProposalByIdApi(proposal.id),
    staleTime: 1000 * 60 * 2,
  });

  const milestones = fullProposal?.milestones ?? [];

  const goToMilestones = () =>
    navigate(`/proposals/${proposal.id}/milestones`, {
      state: { from: "milestone-dashboard" },
    });

  return (
    <Card
      onClick={goToMilestones}
      className="cursor-pointer transition-all duration-200 hover:border-orange-400 hover:shadow-lg overflow-hidden"
    >
      {/* Top section: proposal info */}
      <CardContent className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">

          {/* Left: title + meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold truncate">{proposal.title}</h2>

            <p className="text-sm text-muted-foreground mt-0.5">
              {proposal.domain}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <TRLBadge level={proposal.trlLevel} />
              <StatusBadge status={proposal.status} />
            </div>
          </div>

          {/* Right: key stats */}
          <div className="flex gap-6 shrink-0 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Funding</p>
              <p className="text-sm font-semibold mt-0.5">
                {formatCurrency(proposal.fundingAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Milestones</p>
              <p className="text-sm font-semibold mt-0.5">
                {proposal._count?.milestones ?? milestones.length}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Reviews</p>
              <p className="text-sm font-semibold mt-0.5">
                {proposal._count?.reviews ?? 0}
              </p>
            </div>
          </div>

        </div>
      </CardContent>

      {/* Divider */}
      <div className="mx-6 border-t border-dashed" />

      {/* Bottom section: milestones */}
      <CardContent className="px-6 pt-4 pb-5">

        {milestonesLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No milestones added yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {milestones.slice(0, 4).map((milestone) => {
              const cfg = milestoneStatusConfig[milestone.status];

              return (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Status dot + title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`size-2 rounded-full shrink-0 ${cfg.dot}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium truncate">
                      {milestone.title}
                    </span>
                  </div>

                  {/* Due date + status + fund release */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      Due {new Date(milestone.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span className={`text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>

                    <span className="text-xs font-semibold text-orange-600 min-w-[60px] text-right">
                      {formatCurrency(milestone.fundRelease)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Overflow hint */}
            {milestones.length > 4 && (
              <p className="text-xs text-muted-foreground text-right mt-1">
                +{milestones.length - 4} more milestone{milestones.length - 4 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ProposalMilestoneCard;