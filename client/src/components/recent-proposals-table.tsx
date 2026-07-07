import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getProposalsApi } from '@/api/proposal.api'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TRLBadge } from '@/components/shared/TRLBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString()}`
}

export function RecentProposalsTable() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['proposals', 'recent'],
    queryFn: () => getProposalsApi({ limit: 8, page: 1 }),
  })

  const proposals = data?.proposals ?? []

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Proposals</CardTitle>
          <CardDescription>Latest submissions across the platform</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/proposals')}>
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-hidden border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>TRL</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading proposals...
                  </TableCell>
                </TableRow>
              ) : proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No proposals yet
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((proposal) => (
                  <TableRow
                    key={proposal.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/proposals/${proposal.id}`)}
                  >
                    <TableCell className="font-medium max-w-[220px] truncate">
                      {proposal.title}
                    </TableCell>
                    <TableCell>{proposal.domain}</TableCell>
                    <TableCell>
                      <TRLBadge level={proposal.trlLevel} />
                    </TableCell>
                    <TableCell>{formatCurrency(proposal.fundingAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={proposal.status} />
                    </TableCell>
                    <TableCell>{proposal.applicant?.name ?? '-'}</TableCell>
                    <TableCell>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
