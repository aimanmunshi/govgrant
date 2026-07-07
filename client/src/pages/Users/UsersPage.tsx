import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsersApi } from '@/api/user.api'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
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
import { Search } from 'lucide-react'
import type { Role } from '@/types'

const roleOptions: Role[] = ['ADMIN', 'REVIEWER', 'APPLICANT']

const roleLabel: Record<Role, string> = {
  ADMIN: 'Admin',
  REVIEWER: 'Reviewer',
  APPLICANT: 'Applicant',
}

const UsersPage = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => getUsersApi(roleFilter || undefined),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  const summary = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    reviewers: users.filter((u) => u.role === 'REVIEWER').length,
    applicants: users.filter((u) => u.role === 'APPLICANT').length,
  }), [users])

  const summaryCards = [
    { label: 'Total users', value: summary.total },
    { label: 'Admins', value: summary.admins },
    { label: 'Reviewers', value: summary.reviewers },
    { label: 'Applicants', value: summary.applicants },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View platform accounts
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          className="rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{roleLabel[r]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Proposals</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>{u.organization ?? '-'}</TableCell>
                  <TableCell>{u._count?.proposals ?? 0}</TableCell>
                  <TableCell>{u._count?.reviews ?? 0}</TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default UsersPage
