import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";
import { page } from "@/lib/layout";
import { cn } from "@/lib/cn";

const NAV = [
  { hash: "museums", label: "전시 만들기" },
  { hash: "museums", label: "유물 아카이브" },
  { hash: "my-exhibitions", label: "내 전시" },
];

export function AppHeader({ kicker }: { kicker?: string }) {
  return (
    <header className="border-b border-white/10 bg-navy text-ivory">
      <div className={cn(page, "flex h-[72px] items-center justify-between")}>
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
        <nav className="hidden items-center gap-8 text-[13px] tracking-wide text-ivory/75 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={{ pathname: "/", hash: item.hash }}
              className="hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {kicker ? (
          <p className="hidden max-w-[240px] truncate text-xs tracking-widest text-ivory/70 lg:block">
            {kicker}
          </p>
        ) : (
          <span className="hidden w-24 lg:block" />
        )}
      </div>
    </header>
  );
}
