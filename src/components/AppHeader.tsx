import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";

export function AppHeader({ kicker }: { kicker?: string }) {
  return (
    <header className="border-b border-white/10 bg-navy text-ivory">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={asset("branding/logo.png")}
            alt="Cura"
            className="h-10 w-10 object-contain"
          />
          <div>
            <p className="font-display text-[22px] leading-none tracking-[0.18em]">
              CURA
            </p>
            <p className="mt-1 text-[10px] tracking-[0.28em] text-teal/90">
              CURATE YOUR EXHIBITION
            </p>
          </div>
        </Link>
        {kicker ? (
          <p className="hidden text-xs tracking-widest text-ivory/70 sm:block">
            {kicker}
          </p>
        ) : null}
      </div>
    </header>
  );
}
