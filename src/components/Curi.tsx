import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

export type CuriPose =
  | "main"
  | "wink"
  | "think"
  | "search"
  | "laptop"
  | "present"
  | "idea";

export function Curi({
  pose = "main",
  className,
  alt = "AI 큐레이터 큐리",
}: {
  pose?: CuriPose;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={asset("branding/curi.png")}
      alt={alt}
      data-pose={pose}
      className={cn("object-contain object-center", className)}
    />
  );
}
