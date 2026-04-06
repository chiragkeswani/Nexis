export default function ClassificationBadge({ classification }) {
  const styles = {
    'Likely Truthful': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Uncertain': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Potential Deception Indicators': 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  const style = styles[classification] || styles['Uncertain'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {classification}
    </span>
  );
}
