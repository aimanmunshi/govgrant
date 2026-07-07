import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { updateProfileApi } from '@/api/auth.api'
import { applyTheme, getTheme, type Theme } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoleBadge } from '@/components/shared/RoleBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SettingsPage = () => {
  const { user, updateUser } = useAuth()
  const [theme, setTheme] = useState<Theme>(getTheme())

  const [name, setName] = useState(user?.name ?? '')
  const [organization, setOrganization] = useState(user?.organization ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleThemeChange = (value: string) => {
    if (value !== 'light' && value !== 'dark') return
    setTheme(value)
    applyTheme(value)
  }

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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how GovGrant looks on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={handleThemeChange}
            variant="outline"
          >
            <ToggleGroupItem value="light" className="gap-2 px-4">
              <Sun className="h-4 w-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="gap-2 px-4">
              <Moon className="h-4 w-4" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Profile */}
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

            <div className="grid gap-2">
              <Label>Role</Label>
              <div>{user && <RoleBadge role={user.role} />}</div>
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
    </div>
  )
}

export default SettingsPage
