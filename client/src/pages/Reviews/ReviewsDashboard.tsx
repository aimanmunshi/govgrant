import { useQuery } from "@tanstack/react-query";

import { getProposalsApi } from "@/api/proposal.api";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProposalReviewCard from "@/components/reviews/ProposalReviewCard";
import ReviewerProposalCard from "@/components/reviews/ReviewerProposalCard";
import AdminProposalReviewCard from "@/components/reviews/AdminProposalReviewCard";

// ─── Component ────────────────────────────────────────────────────────────────

const ReviewsDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => getProposalsApi({ limit: 100 }),
  });

  const proposals = data?.proposals ?? [];

  // ── Derived stats (APPLICANT) ───────────────────────────────────────────────
  const proposalsWithReviews = proposals.filter(
    (p) => (p._count?.reviews ?? 0) > 0
  ).length;

  const totalReviews = proposals.reduce(
    (sum, p) => sum + (p._count?.reviews ?? 0),
    0
  );

  // ── Summary cards config per role ───────────────────────────────────────────
  const summaryCards: Record<string, { label: string; value: number }[]> = {
    APPLICANT: [
      { label: "My proposals",        value: proposals.length       },
      { label: "Proposals reviewed",  value: proposalsWithReviews   },
      { label: "Total reviews",       value: totalReviews           },
    ],
    REVIEWER: [
  { label: "Assigned",  value: proposals.length },
  { label: "Reviewed",  value: proposals.filter((p) => (p._count?.reviews ?? 0) > 0).length },
  { label: "Pending",   value: proposals.filter((p) => (p._count?.reviews ?? 0) === 0).length },
],
    ADMIN: [
  { label: "Total proposals", value: proposals.length },
  { label: "Total reviews",   value: totalReviews     },
  { label: "Unassigned",      value: proposals.filter((p) => !p.assignments?.length).length },
],
  };

  const activeSummary = summaryCards[user?.role ?? ""] ?? [];

  // ── Page meta per role ──────────────────────────────────────────────────────
  const pageMeta: Record<string, { title: string; description: string }> = {
    APPLICANT: {
      title:       "Reviews",
      description: "See feedback submitted by reviewers on your proposals.",
    },
    REVIEWER: {
      title:       "Reviews",
      description: "Proposals assigned to you for evaluation.",
    },
    ADMIN: {
      title:       "Reviews",
      description: "Manage reviewer assignments and monitor all submitted reviews.",
    },
  };

  const meta = pageMeta[user?.role ?? ""] ?? {
    title: "Reviews",
    description: "",
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{meta.title}</h1>
        <p className="text-muted-foreground mt-1">{meta.description}</p>
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

      {/* Role-based content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading reviews...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── APPLICANT view ─────────────────────────────────────────────── */}
          {user?.role === "APPLICANT" && (
            proposals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  You haven't submitted any proposals yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5">
                {proposals.map((proposal) => (
                  <ProposalReviewCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )
          )}

          {/* ── REVIEWER view ──────────────────────────────────────────────── */}
          {user?.role === "REVIEWER" && (
  proposals.length === 0 ? (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        No proposals assigned to you yet.
      </CardContent>
    </Card>
  ) : (
    <div className="grid gap-5">
      {proposals.map((proposal) => (
        <ReviewerProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  )
)}

          {/* ── ADMIN view ─────────────────────────────────────────────────── */}
          {user?.role === "ADMIN" && (
  proposals.length === 0 ? (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        No proposals found.
      </CardContent>
    </Card>
  ) : (
    <div className="grid gap-5">
      {proposals.map((proposal) => (
        <AdminProposalReviewCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  )
)}
        </>
      )}

    </div>
  );
};

export default ReviewsDashboard;