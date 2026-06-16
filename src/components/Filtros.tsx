export type Filter = {
  name: string;
  label: string;
  value: string;
  type: "input" | "select" | "date";
  placeholder?: string;
  options?: Option[];
  disabled?: boolean;
  hideAllOption?: boolean;
};
export interface Option {
  label: string;
  value: string;
}

type FilterProps = {
  filters: Filter[];
  onChange: (name: string, value: string) => void;
  onClear: () => void;
  title?: string;
  titleClassName?: string;
  inputFocusClassName?: string;
};

const defaultInputFocus =
  "focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

export default function Filtros({
  filters,
  onChange,
  onClear,
  title = "Filtros",
  titleClassName = "text-xl font-semibold",
  inputFocusClassName = defaultInputFocus,
}: FilterProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className={`mb-4 ${titleClassName}`}>{title}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {filters.map((f) => {
          if (f.type === "input") {
            return (
              <div key={f.name} className="flex flex-col gap-1">
                {f.label && (
                  <label className="text-xs font-semibold text-slate-500">
                    {f.label}
                  </label>
                )}

                <input
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition ${inputFocusClassName}`}
                />
              </div>
            );
          }
          if (f.type === "date") {
            return (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  {f.label}
                </label>
                <input
                  type="date"
                  value={f.value}
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
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition ${inputFocusClassName}`}
                >
                  {!f.hideAllOption && <option value="">Todos</option>}
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
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="whitespace-nowrap rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
