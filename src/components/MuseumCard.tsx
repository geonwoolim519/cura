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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col border border-line bg-paper"
    >
      <div className="relative h-52 overflow-hidden bg-navy">
        <HeritageImage
          src={museum.image}
          alt={museum.name}
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        <p className="absolute bottom-3 left-4 text-[11px] tracking-[0.22em] text-teal">
          {museum.periodLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col px-6 py-6">
        <h3 className="font-serif text-2xl text-navy">{museum.name}</h3>
        <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-7 text-muted">
          {museum.cardText}
        </p>
        <button
          type="button"
          onClick={onSelect}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 bg-navy px-4 text-sm tracking-wide text-ivory"
        >
          전시 만들기
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}
