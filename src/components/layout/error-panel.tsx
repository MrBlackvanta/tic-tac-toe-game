import { Logo } from "@/components/icons";
import type { ReactNode } from "react";

type ErrorPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function ErrorPanel({
  title,
  description,
  children,
}: ErrorPanelProps) {
  return (
    <main className="flex grow flex-col p-6">
      <div className="m-auto w-full max-w-82 md:max-w-115">
        <Logo className="mx-auto" />
        <div className="mt-8 rounded-lg bg-surface px-6 pt-6 pb-7.5 text-center inset-shadow-lg inset-shadow-surface-dark md:mt-10">
          <h1 className="text-heading-s text-balance uppercase md:text-heading-m">
            {title}
          </h1>
          <p className="mt-4 text-balance">{description}</p>
        </div>
        <div className="mt-8 grid gap-4 md:mt-10 md:gap-5">{children}</div>
      </div>
    </main>
  );
}
