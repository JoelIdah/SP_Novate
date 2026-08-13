import type { ReactNode } from "react";

type DashboardShellProps = {
  navbar: ReactNode;
  children: ReactNode;
  homeFit?: boolean;
  className?: string;
  mainClassName?: string;
  contentClassName?: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Shared frame for student and tutor dashboard routes.
 *
 * Page scrolling is the default. A bounded workspace can opt into different
 * overflow behavior through mainClassName without rebuilding the app frame.
 */
export function DashboardShell({
  navbar,
  children,
  homeFit = false,
  className,
  mainClassName,
  contentClassName,
}: DashboardShellProps) {
  return (
    <div
      className={cx(
        "dashboard-screen bg-white text-brand-ink",
        homeFit && "dashboard-home-fit",
        className
      )}
    >
      <div className="dashboard-shell">
        {navbar}
        <main
          className={cx(
            "dashboard-main overflow-y-auto overflow-x-hidden scrollbar-hover",
            mainClassName
          )}
        >
          <div
            className={cx(
              "dashboard-content-frame px-[var(--dashboard-gutter)]",
              contentClassName
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
