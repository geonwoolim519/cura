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
  periods,
  materials,
  categories,
}: {
  query: string;
  onQuery: (v: string) => void;
  period: string;
  onPeriod: (v: string) => void;
  material: string;
  onMaterial: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  periods: string[];
  materials: string[];
  categories: string[];
}) {
  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="유물명, 키워드 검색"
        className="h-11 w-full border border-line bg-paper px-3 text-sm outline-none focus:border-navy"
      />
      <div className="grid grid-cols-3 gap-2">
        <Select label="시대" value={period} onChange={onPeriod} options={periods} />
        <Select
          label="재질"
          value={material}
          onChange={onMaterial}
          options={materials}
        />
        <Select
          label="분류"
          value={category}
          onChange={onCategory}
          options={categories}
        />
      </div>
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
        className={cn(
          "mt-1 h-10 w-full border border-line bg-paper px-2 text-sm outline-none",
        )}
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
