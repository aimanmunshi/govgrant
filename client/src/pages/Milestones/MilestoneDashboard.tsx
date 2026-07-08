import { useQuery } from "@tanstack/react-query";

import { getProposalsApi } from "@/api/proposal.api";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProposalMilestoneCard from "@/components/milestones/ProposalMilestoneCard";

// ─── Component ────────────────────────────────────────────────────────────────

const MilestoneDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["proposals", { limit: 100 }],
    queryFn: () => getProposalsApi({ limit: 100 }),
  });

  const proposals = data?.proposals ?? [];

  // ── Derived counts ──────────────────────────────────────────────────────────
  const totalProjects     = proposals.length;
  const approvedProjects  = proposals.filter((p) => p.status === "APPROVED").length;
  const fundedProjects    = proposals.filter((p) => p.status === "FUNDED").length;
  const draftProjects     = proposals.filter((p) => p.status === "DRAFT").length;
  const underReviewProjects = proposals.filter((p) => p.status === "UNDER_REVIEW").length;
  const totalMilestones   = proposals.reduce((sum, p) => sum + (p._count?.milestones ?? 0), 0);
  const totalReviews      = proposals.reduce((sum, p) => sum + (p._count?.reviews ?? 0), 0);

  // ── Summary cards config per role ───────────────────────────────────────────
  const summaryCards: Record<string, { label: string; value: number }[]> = {
    APPLICANT: [
      { label: "My Projects",       value: totalProjects },
      { label: "Draft Projects",    value: draftProjects },
      { label: "Approved / Funded", value: approvedProjects + fundedProjects },
    ],
    REVIEWER: [
      { label: "Under Review",    value: underReviewProjects },
      { label: "Total Milestones", value: totalMilestones },
      { label: "Total Reviews",   value: totalReviews },
    ],
    ADMIN: [
      { label: "Total Projects",   value: totalProjects },
      { label: "Total Milestones", value: totalMilestones },
      { label: "Funded Projects",  value: fundedProjects },
    ],
  };

  const activeSummary = summaryCards[user?.role ?? ""] ?? [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Milestones</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor milestones across all proposals.
        </p>
      </div>

      {/* Summary cards */}
      {activeSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSummary.map(({ label, value }) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Proposal list */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading milestone dashboard...
          </CardContent>
        </Card>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects available yet.
            <br />
            Projects will appear here once proposals are created.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {proposals.map((proposal) => (
            <ProposalMilestoneCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

    </div>
  );
};

export default MilestoneDashboard;