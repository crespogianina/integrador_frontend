type FilterOption = {
  label: string;
  value: string;
};

type FilterField = {
  type: "input" | "select";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
};

type FiltersProps = {
  title?: string;
  filters: FilterField[];
  onClear: () => void;
};

export default function Filters({
  title = "Filtros",
  filters,
  onClear,
}: FiltersProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">{title}</h2>

      <div className="grid gap-3 md:grid-cols-4">
        {filters.map((filter, index) => {
          if (filter.type === "input") {
            return (
              <input
                key={index}
                value={filter.value}
                placeholder={filter.placeholder}
                onChange={(e) => filter.onChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            );
          }

          if (filter.type === "select") {
            return (
              <select
                key={index}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}

        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
