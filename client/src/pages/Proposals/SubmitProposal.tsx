import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createProposalApi,
    getProposalByIdApi,
    updateProposalApi,
} from '@/api/proposal.api'
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
    const { id } = useParams()

    const isEditMode = Boolean(id)
    const proposalId = Number(id)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        title: '',
        description: '',
        trlLevel: 4,
        fundingAmount: 0,
        domain: 'Rural Broadband',
    })

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const { data: proposalData, isLoading: proposalLoading } = useQuery({
        queryKey: ['proposal', proposalId],
        queryFn: () => getProposalByIdApi(proposalId),
        enabled: isEditMode,
    })

    useEffect(() => {
        if (!proposalData) return

        setForm({
            title: proposalData.title,
            description: proposalData.description,
            trlLevel: proposalData.trlLevel,
            fundingAmount: proposalData.fundingAmount,
            domain: proposalData.domain,
        })
    }, [proposalData])


    const { mutate, isPending } = useMutation({
        mutationFn: (payload: typeof form) =>
            isEditMode
                ? updateProposalApi(proposalId, payload)
                : createProposalApi(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['proposals'] })

            queryClient.invalidateQueries({
                queryKey: ['proposal', proposalId],
            })

            navigate(`/proposals/${data.id}`)
        },
        onError: (err: any) => {
            const data = err.response?.data
            if (data?.errors) {
                // field level errors from Zod
                const errors: Record<string, string> = {}
                Object.entries(data.errors).forEach(([key, val]) => {
                    errors[key] = (val as string[])[0]
                })
                setFieldErrors(errors)
            } else {
                setError(data?.message || 'Failed to create proposal')
            }
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


    if (proposalLoading) {
        return (
            <div className="p-6">
                Loading proposal...
            </div>
        )
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
                    <h1 className="text-2xl font-bold">
                        {isEditMode ? 'Continue Draft' : 'New Proposal'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isEditMode
                            ? 'Continue editing your proposal'
                            : 'Submit a new R&D grant proposal'}
                    </p>
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
                                className={fieldErrors.title ? 'border-red-500' : ''}
                            />
                            {fieldErrors.title && (
                                <p className="text-xs text-red-400">{fieldErrors.title}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                placeholder="Describe your project in detail (minimum 20 characters)..."
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className={`w-full rounded-md bg-input border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none ${fieldErrors.description ? 'border-red-500' : 'border-border'}`}
                            />
                            {fieldErrors.description && (
                                <p className="text-xs text-red-400">{fieldErrors.description}</p>
                            )}
                            <p className={`text-xs ${form.description.length < 20 ? 'text-red-400' : 'text-green-400'}`}>
                                {form.description.length}/20 minimum characters
                            </p>
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
                                {fieldErrors.domain && (
                                    <p className="text-xs text-red-400">{fieldErrors.domain}</p>
                                )}
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
                                    className={fieldErrors.trlLevel ? 'border-red-500' : ''}
                                />
                                {fieldErrors.trlLevel && (
                                    <p className="text-xs text-red-400">{fieldErrors.trlLevel}</p>
                                )}
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
                                className={fieldErrors.fundingAmount ? 'border-red-500' : ''}
                            />
                            {fieldErrors.fundingAmount && (
                                <p className="text-xs text-red-400">{fieldErrors.fundingAmount}</p>
                            )}
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
                                {isPending
                                    ? isEditMode
                                        ? 'Saving...'
                                        : 'Creating...'
                                    : isEditMode
                                        ? 'Save Draft'
                                        : 'Create Proposal'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default SubmitProposal