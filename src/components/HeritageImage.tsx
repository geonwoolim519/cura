import { useState } from "react";
import { cn } from "@/lib/cn";

export function HeritageImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-mist text-warm",
          className,
        )}
      >
        <div className="px-3 text-center">
          <div className="mx-auto mb-2 h-10 w-10 border border-gold/70" />
          <p className="font-serif text-sm">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
