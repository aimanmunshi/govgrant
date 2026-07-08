import { useState } from "react"
import { MailWarning } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { resendVerificationApi } from "@/api/auth.api"

export function VerifyEmailBanner() {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  if (!user || user.emailVerified) return null

  const handleResend = async () => {
    setIsSending(true)
    try {
      await resendVerificationApi()
      setSent(true)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-b bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400">
      <MailWarning className="size-4 shrink-0" />
      <span>Please verify your email address ({user.email}).</span>
      {sent ? (
        <span className="text-xs text-muted-foreground">Verification email sent — check your inbox.</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={isSending}
          className="ml-auto text-xs font-medium underline underline-offset-4 hover:no-underline disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Resend email"}
        </button>
      )}
    </div>
  )
}
