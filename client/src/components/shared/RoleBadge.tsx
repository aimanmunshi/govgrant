import { Role } from '@/types';

const roleConfig: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  REVIEWER: { label: 'Reviewer', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  APPLICANT: { label: 'Applicant', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export const RoleBadge = ({ role }: { role: Role }) => {
  const config = roleConfig[role];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};
