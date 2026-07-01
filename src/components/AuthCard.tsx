import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:bg-zinc-950 dark:shadow-none dark:ring-1 dark:ring-zinc-800">
        <div className="px-8 pb-2 pt-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <div className="px-8 pb-8 pt-6">{children}</div>

        <div className="bg-zinc-100 px-6 py-4 text-center text-xs leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          Only @berkeley.edu accounts can sign in.
        </div>
      </div>
      {footer && <div className="mt-4 text-center text-sm text-zinc-500">{footer}</div>}
    </div>
  );
}
