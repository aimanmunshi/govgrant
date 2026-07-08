import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AuthLayout } from "@/components/AuthLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyEmailApi } from "@/api/auth.api"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("This verification link is missing its token.")
      return
    }

    verifyEmailApi(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error")
        setMessage(err.response?.data?.message || "Failed to verify email")
      })
  }, [token])

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === "verifying" && "Verifying your email..."}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription>
            {status === "success" && "Your email has been confirmed. You're all set."}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/login" className="text-sm underline underline-offset-4">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
