import { useState } from "react"
import { Link } from "react-router-dom"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordApi } from "@/api/auth.api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await forgotPasswordApi(email)
    } finally {
      // always show the same success state — don't reveal whether the email exists
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
              If that email is registered, a reset link has been sent. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@organization.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
