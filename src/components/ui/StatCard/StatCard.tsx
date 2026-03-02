export type StatCardVariant = "default" | "danger" | "warning" | "success";

interface StatCardProps {
  title: string;
  value: number | string;
  variant?: StatCardVariant;
}

const variantClasses: Record<
  StatCardVariant,
  { bg: string; border: string; title: string; value: string }
> = {
  default: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/50",
    title: "text-gray-600",
    value: "text-gray-700",
  },
  danger: {
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    title: "text-red-500",
    value: "text-red-600",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
    title: "text-amber-600",
    value: "text-amber-600",
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/50",
    title: "text-green-600",
    value: "text-green-600",
  },
};

export default function StatCard({
  title,
  value,
  variant = "default",
}: StatCardProps) {
  const v = variantClasses[variant];

  return (
    <div
      className={`${v.bg} border ${v.border} rounded-xl p-4`}
    >
      <div className={`text-sm ${v.title}`}>{title}</div>
      <div className={`text-2xl font-bold ${v.value}`}>{value}</div>
    </div>
  );
}
