import type { ReactNode } from "react";
import { brand } from "../../lib/brand";
import BurgerIcon from "./BurgerIcon";

type AuthPageShellProps = {
  children: ReactNode;
};

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className={`relative flex min-h-screen flex-col font-nunito ${brand.pageBg}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: brand.catalogPattern,
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex items-center gap-2.5">
          <BurgerIcon className="h-10 w-10 shrink-0 text-amber-600" />
          <span className="text-2xl font-bold text-slate-800">Food Store</span>
        </div>

        {children}
      </main>
    </div>
  );
}
