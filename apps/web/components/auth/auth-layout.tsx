import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </header>

        {children}

        {footer ? <div className="space-y-2 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}

