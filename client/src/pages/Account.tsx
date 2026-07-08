import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { updateProfileApi } from '@/api/auth.api'
import { getProposalsApi } from '@/api/proposal.api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, Activity, FileText, ClipboardList } from 'lucide-react'
import type { Proposal } from '@/types'

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString()}`
}

const AccountPage = () => {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [organization, setOrganization] = useState(user?.organization ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => updateProfileApi({ name, organization: organization || undefined }),
    onSuccess: (updated) => {
      updateUser(updated)
      setError('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update profile')
      setSuccess(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    saveProfile()
  }

  const { data, isLoading } = useQuery({
    queryKey: ['proposals', { limit: 100 }],
    queryFn: () => getProposalsApi({ limit: 100 }),
    enabled: user?.role === 'APPLICANT' || user?.role === 'REVIEWER',
  })

  const proposals = data?.proposals ?? []

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your identity and activity on GovGrant
        </p>
      </div>

      {/* Identity card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-14 w-14 rounded-lg">
            <AvatarFallback className="rounded-lg text-lg">
              {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold">{user?.name}</span>
              {user && <RoleBadge role={user.role} />}
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.organization && (
              <p className="text-sm text-muted-foreground">{user.organization}</p>
            )}
          </div>
          {memberSince && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">{memberSince}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile edit */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
                Profile updated
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. IIT Delhi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Role-specific: APPLICANT */}
      {user?.role === 'APPLICANT' && (
        <ApplicantSection proposals={proposals} isLoading={isLoading} />
      )}

      {/* Role-specific: REVIEWER */}
      {user?.role === 'REVIEWER' && (
        <ReviewerSection proposals={proposals} isLoading={isLoading} userId={user.id} />
      )}

      {/* Role-specific: ADMIN */}
      {user?.role === 'ADMIN' && <AdminSection />}
    </div>
  )
}

const ApplicantSection = ({
  proposals,
  isLoading,
}: {
  proposals: Proposal[]
  isLoading: boolean
}) => {
  const total = proposals.length
  const approvedFunded = proposals.filter((p) => p.status === 'APPROVED' || p.status === 'FUNDED')
  const totalRequested = proposals.reduce((sum, p) => sum + p.fundingAmount, 0)
  const totalApproved = approvedFunded.reduce((sum, p) => sum + p.fundingAmount, 0)
  const recent = [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My proposals</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved/Funded</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : approvedFunded.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total requested</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(totalRequested)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total approved</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(totalApproved)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent proposals</CardTitle>
          <Link to="/proposals" className="text-xs text-orange-400 hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">You haven't submitted any proposals yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to={`/proposals/${p.id}`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/50">
                    <span className="text-sm font-medium truncate">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

const ReviewerSection = ({
  proposals,
  isLoading,
  userId,
}: {
  proposals: Proposal[]
  isLoading: boolean
  userId: number
}) => {
  const assigned = proposals.filter((p) => p.assignments?.some((a) => a.reviewerId === userId))
  const awaitingReview = assigned.filter((p) => p.status === 'UNDER_REVIEW')

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to me</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : assigned.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting your review</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{isLoading ? '...' : awaitingReview.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proposals awaiting your review</CardTitle>
          <Link to="/reviews" className="text-xs text-orange-400 hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          {awaitingReview.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nothing pending right now.</p>
          ) : (
            <ul className="divide-y divide-border">
              {awaitingReview.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link to={`/proposals/${p.id}/review`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/50">
                    <span className="text-sm font-medium truncate">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

const AdminSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Link to="/users">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3 pt-6">
          <Users className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium">Manage users</p>
            <p className="text-xs text-muted-foreground">View and update roles across the platform</p>
          </div>
        </CardContent>
      </Card>
    </Link>
    <Link to="/activity">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3 pt-6">
          <Activity className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium">Activity log</p>
            <p className="text-xs text-muted-foreground">See recent actions across the platform</p>
          </div>
        </CardContent>
      </Card>
    </Link>
    <Link to="/proposals">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3 pt-6">
          <FileText className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium">All proposals</p>
            <p className="text-xs text-muted-foreground">Browse every proposal on the platform</p>
          </div>
        </CardContent>
      </Card>
    </Link>
    <Link to="/reviews">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3 pt-6">
          <ClipboardList className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium">Reviews</p>
            <p className="text-xs text-muted-foreground">Manage reviewer assignments</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  </div>
)

export default AccountPage
