import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordApi } from "@/api/auth.api"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await resetPasswordApi(token, password)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Invalid link</CardTitle>
            <CardDescription>This password reset link is missing its token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/forgot-password" className="text-sm underline underline-offset-4">
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
              Password reset. Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 10 characters, including a letter and a number
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
