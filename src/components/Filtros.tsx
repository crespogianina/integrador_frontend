export type Filter = {
  name: string;
  label: string;
  value: string;
  type: "input" | "select";
  placeholder?: string;
  options?: Option[];
};
export interface Option {
  label: string;
  value: string;
}

type FilterProps = {
  filters: Filter[];
  onChange: (name: string, value: string) => void;
  onClear: () => void;
};

export default function Filtros({ filters, onChange, onClear }: FilterProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold">Filtros</h2>

      <div className="grid gap-3 md:grid-cols-4 ">
        {filters.map((f) => {
          if (f.type === "input") {
            return (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  {f.label}
                </label>

                <input
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            );
          }

          if (f.type === "select") {
            return (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  {f.label}
                </label>

                <select
                  value={f.value}
                  onChange={(e) => onChange(f.name, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Todos</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return null;
        })}

        <div className="flex items-end pb-1.5">
          <button
            onClick={onClear}
            className="w-fit h-fit rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
