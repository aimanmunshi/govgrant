import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProposalApi } from '@/api/proposal.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const domains = [
  'Rural Broadband',
  '5G Technology',
  'Satellite Communication',
  'Optical Fiber',
  'IoT',
  'AI/ML',
  'Cybersecurity',
  'Other',
]

const SubmitProposal = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    trlLevel: 4,
    fundingAmount: 0,
    domain: 'Rural Broadband',
  })

  

  const { mutate, isPending } = useMutation({
    mutationFn: createProposalApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      navigate(`/proposals/${data.id}`)
    },
    onError: (err: any) => {
  console.log('Error response:', err.response?.data);
  setError(err.response?.data?.message || 'Failed to create proposal')
},
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: name === 'trlLevel' || name === 'fundingAmount' ? Number(value) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutate(form)
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/proposals')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Proposal</h1>
          <p className="text-muted-foreground text-sm">Submit a new R&D grant proposal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
          <CardDescription>
            Fill in the details of your R&D grant proposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label>Project Title</Label>
              <Input
                name="title"
                placeholder="Rural 5G Connectivity Project"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                name="description"
                placeholder="Describe your project in detail..."
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Domain</Label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className="rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>TRL Level (1-9)</Label>
                <Input
                  name="trlLevel"
                  type="number"
                  min={1}
                  max={9}
                  value={form.trlLevel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Funding Amount (₹)</Label>
              <Input
                name="fundingAmount"
                type="number"
                placeholder="10000000"
                value={form.fundingAmount}
                onChange={handleChange}
                required
              />
              {form.fundingAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  ₹{(form.fundingAmount / 10000000).toFixed(2)} Crores
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/proposals')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPending ? 'Creating...' : 'Create Proposal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitProposal