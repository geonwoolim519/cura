import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MuseumInfo } from "@/data/museums";
import { HeritageImage } from "./HeritageImage";

export function MuseumCard({
  museum,
  onSelect,
}: {
  museum: MuseumInfo;
  onSelect: () => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col overflow-hidden rounded-sm border border-line bg-paper"
    >
      <div className="relative h-44 overflow-hidden bg-navy md:h-52">
        <HeritageImage
          src={museum.image}
          alt={museum.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/20" />
        <div className="absolute left-3 top-3 flex gap-1">
          {museum.group === "world" ? (
            <span className="bg-navy px-2 py-0.5 text-[10px] tracking-[0.18em] text-ivory">
              WORLD
            </span>
          ) : null}
        </div>
        <p className="absolute bottom-3 left-3 text-[11px] tracking-[0.2em] text-ivory">
          {museum.periodLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="font-serif text-xl leading-7 text-navy md:text-[22px]">
          {museum.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{museum.cardText}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {museum.tags.map((tag) => (
            <span
              key={tag}
              className="border border-line px-2 py-0.5 text-[10px] tracking-wide text-warm"
            >
              {tag}
            </span>
          ))}
        </div>
        <button type="button" onClick={onSelect} className="btn btn-primary mt-5 w-full">
          전시 만들기
          <ArrowRight size={15} />
        </button>
      </div>
    </motion.article>
  );
}
