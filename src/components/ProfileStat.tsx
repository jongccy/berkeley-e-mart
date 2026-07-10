type Props = {
  value: string | number;
  label: string;
};

export function ProfileStat({ value, label }: Props) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span className="text-2xl font-bold text-[#003262] dark:text-[#FDB515]">
        {value}
      </span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
    </div>
  );
}
