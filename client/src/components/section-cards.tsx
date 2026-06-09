import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import axiosInstance from '@/api/axiosInstance'
import { Proposal } from '@/types'
import { PaginatedResponse } from '@/types'

export function SectionCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['proposals', 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/proposals?limit=100')
      return response.data.data as PaginatedResponse<Proposal>
    },
  })

  const proposals = data?.proposals ?? []

  const totalProposals = proposals.length
  const pendingReviews = proposals.filter(p => p.status === 'UNDER_REVIEW').length
  const approvedProposals = proposals.filter(p => p.status === 'APPROVED' || p.status === 'FUNDED').length
  const totalFunding = proposals
    .filter(p => p.status === 'APPROVED' || p.status === 'FUNDED')
    .reduce((sum, p) => sum + p.fundingAmount, 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${amount.toLocaleString()}`
  }

  const cards = [
    {
      title: 'Total Proposals',
      value: isLoading ? '...' : totalProposals.toString(),
      description: 'All proposals on platform',
      icon: FileText,
      badge: 'Total',
      badgeColor: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'Pending Reviews',
      value: isLoading ? '...' : pendingReviews.toString(),
      description: 'Proposals under review',
      icon: Clock,
      badge: 'Active',
      badgeColor: 'bg-yellow-500/10 text-yellow-400',
    },
    {
      title: 'Approved Proposals',
      value: isLoading ? '...' : approvedProposals.toString(),
      description: 'Approved and funded',
      icon: CheckCircle,
      badge: 'Approved',
      badgeColor: 'bg-green-500/10 text-green-400',
    },
    {
      title: 'Total Funding',
      value: isLoading ? '...' : formatCurrency(totalFunding),
      description: 'Approved funding amount',
      icon: DollarSign,
      badge: 'Funding',
      badgeColor: 'bg-orange-500/10 text-orange-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                {card.badge}
              </span>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}