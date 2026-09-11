import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

type CuriPose =
  | "main"
  | "wink"
  | "think"
  | "search"
  | "laptop"
  | "present"
  | "idea";

const FRAMES: Record<CuriPose, { size: string; position: string }> = {
  main: { size: "300% auto", position: "42% 4%" },
  wink: { size: "420% auto", position: "86% 14%" },
  think: { size: "420% auto", position: "74% 36%" },
  search: { size: "360% auto", position: "8% 68%" },
  laptop: { size: "360% auto", position: "32% 68%" },
  present: { size: "340% auto", position: "56% 66%" },
  idea: { size: "360% auto", position: "82% 66%" },
};

export function Curi({
  pose = "main",
  className,
  alt = "AI 큐레이터 큐리",
}: {
  pose?: CuriPose;
  className?: string;
  alt?: string;
}) {
  const frame = FRAMES[pose];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("overflow-hidden bg-[#e8eef4]", className)}
      style={{
        backgroundImage: `url(${asset("branding/curi-sheet.png")})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: frame.size,
        backgroundPosition: frame.position,
      }}
    />
  );
}
