const getTRLColor = (level: number) => {
  if (level <= 3) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (level <= 6) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-green-500/10 text-green-400 border-green-500/20';
};

export const TRLBadge = ({ level }: { level: number }) => {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTRLColor(level)}`}>
      TRL {level}
    </span>
  );
};