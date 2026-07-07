import { FundingByDomainChart } from "@/components/charts/FundingByDomainChart"
import { ProposalStatusChart } from "@/components/charts/ProposalStatusChart"
import { RecentProposalsTable } from "@/components/recent-proposals-table"
import { SectionCards } from "@/components/section-cards"

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <ProposalStatusChart />
            <FundingByDomainChart />
          </div>
          <RecentProposalsTable />
        </div>
      </div>
    </div>
  )
}
