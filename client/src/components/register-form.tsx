import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    role: 'APPLICANT',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Register to submit or manage grant proposals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Aiman Munshi"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="C-DOT, IIT Delhi, etc."
                  value={form.organization}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="APPLICANT">Applicant</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}