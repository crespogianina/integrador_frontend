export type Filter = {
  name: string;
  value: string;
  type: "input" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type Props = {
  filters: Filter[];
  onChange: (name: string, value: string) => void;
  onClear: () => void;
};

export default function Filtros({ filters, onChange, onClear }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold">Filtros</h2>

      <div className="grid gap-3 md:grid-cols-4">
        {filters.map((f) => {
          if (f.type === "input") {
            return (
              <input
                key={f.name}
                value={f.value}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.name, e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
            );
          }

          if (f.type === "select") {
            return (
              <select
                key={f.name}
                value={f.value}
                onChange={(e) => onChange(f.name, e.target.value)}
                className="rounded-lg border px-3 py-2"
              >
                <option value="">Todos</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}

        <button onClick={onClear} className="border px-4 py-2 rounded-lg">
          Limpiar
        </button>
      </div>
    </div>
  );
}
