import { cn } from "@/lib/cn";

export function ArtifactFilter({
  query,
  onQuery,
  period,
  onPeriod,
  material,
  onMaterial,
  category,
  onCategory,
  region,
  onRegion,
  recommended,
  onRecommended,
  periods,
  materials,
  categories,
  regions,
  noun,
}: {
  query: string;
  onQuery: (v: string) => void;
  period: string;
  onPeriod: (v: string) => void;
  material: string;
  onMaterial: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  region: string;
  onRegion: (v: string) => void;
  recommended: boolean;
  onRecommended: (v: boolean) => void;
  periods: string[];
  materials: string[];
  categories: string[];
  regions: string[];
  noun: string;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[11px] tracking-[0.28em] text-warm">FILTER</p>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={`${noun}명, 키워드 검색`}
        className="h-11 w-full rounded-sm border border-line bg-ivory px-3 text-sm outline-none focus:border-navy"
      />
      <button
        type="button"
        onClick={() => onRecommended(!recommended)}
        className={cn(
          "h-9 w-full rounded-sm text-xs tracking-wide",
          recommended ? "bg-navy text-ivory" : "border border-line text-muted",
        )}
      >
        추천 {noun}
      </button>
      <Select label="시대" value={period} onChange={onPeriod} options={periods} />
      <Select label="재질" value={material} onChange={onMaterial} options={materials} />
      <Select label="분류" value={category} onChange={onCategory} options={categories} />
      <Select label="지역" value={region} onChange={onRegion} options={regions} />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-warm">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-sm border border-line bg-ivory px-2 text-sm outline-none"
      >
        <option value="">전체</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
