import { ProposalStatus } from '@/types';

const statusConfig: Record<ProposalStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  APPROVED: { label: 'Approved', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  FUNDED: { label: 'Funded', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

export const StatusBadge = ({ status }: { status: ProposalStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};