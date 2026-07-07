import {
  FileText,
  Star,
  Milestone,
  Users,
  ArrowRight,
  Mail,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const workflow = [
  { stage: 'Draft', description: 'Applicant drafts a proposal — title, description, TRL level, funding amount, and domain.' },
  { stage: 'Submitted', description: 'Applicant submits the draft. It becomes read-only and awaits reviewer assignment.' },
  { stage: 'Under Review', description: 'Admin assigns one or more reviewers, who evaluate the proposal and submit a score with comments.' },
  { stage: 'Approved / Rejected', description: 'Admin reviews the scores and decides the outcome.' },
  { stage: 'Funded', description: 'Approved proposals track milestones; once every milestone is completed, the proposal is marked Funded.' },
]

const roles = [
  {
    icon: FileText,
    title: 'Applicant',
    points: [
      'Create, edit, and submit proposals',
      'Track review status and feedback',
      'Add and monitor milestones once approved',
    ],
  },
  {
    icon: Star,
    title: 'Reviewer',
    points: [
      'View proposals assigned for evaluation',
      'Submit a score (0–100) with written comments',
      'One review per proposal',
    ],
  },
  {
    icon: Users,
    title: 'Admin',
    points: [
      'Assign reviewers and manage proposal status',
      'View all users and the platform activity log',
      'Oversee the full proposal lifecycle',
    ],
  },
]

const faqs = [
  {
    q: 'How do I submit a proposal?',
    a: 'Go to Proposals → New Proposal, fill in the required details, and save as a draft. When it’s ready, open the draft and click Submit — this locks it for review.',
  },
  {
    q: 'Can I edit a proposal after submitting it?',
    a: 'No. Once a proposal leaves Draft status, its content is locked. Contact an admin if a correction is needed.',
  },
  {
    q: 'How is a proposal approved?',
    a: 'An admin assigns reviewers once a proposal is submitted. Reviewers score it independently, and an admin makes the final approve/reject decision based on those scores.',
  },
  {
    q: 'What are milestones?',
    a: 'Approved proposals are broken into funded milestones. Each milestone has a due date and a portion of the total funding. When all milestones are marked Completed, the proposal automatically becomes Funded.',
  },
  {
    q: 'Where can I see recent platform activity?',
    a: 'Admins can view a full audit trail — proposal submissions, status changes, reviewer assignments, and milestone updates — from Activity Log in the sidebar.',
  },
]

const HelpPage = () => {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground text-sm mt-1">
          A quick guide to how GovGrant works
        </p>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About GovGrant</CardTitle>
          <CardDescription>
            A platform for managing R&D grant proposals end to end
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GovGrant helps applicants submit research and development proposals,
            lets reviewers evaluate them, and gives admins the tools to approve
            funding and track milestone-based disbursement — from first draft
            through to a fully funded project.
          </p>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>How a proposal moves through the platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-4">
            {workflow.map((step, i) => (
              <li key={step.stage} className="flex gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.stage}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <role.icon className="h-4 w-4 text-orange-400" />
                  <p className="text-sm font-semibold">{role.title}</p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {role.points.map((point) => (
                    <li key={point} className="text-xs text-muted-foreground flex gap-1.5">
                      <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="h-4 w-4 text-orange-400" />
            Milestones & funding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Funding is released against milestones, not all at once. Each milestone
            carries a due date and a portion of the total approved amount. A
            proposal is marked <span className="text-foreground font-medium">Funded</span> automatically
            once every milestone on it is completed.
          </p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {faqs.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{item.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="flex items-center gap-3 py-5">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Still need help? Reach out to your platform administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default HelpPage
