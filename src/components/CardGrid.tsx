export type CardField<T> = {
  label: string;
  render: (item: T) => React.ReactNode;
};

type CardGridProps<T> = {
  title: string;
  total: number;
  data: T[];
  getRowId: (item: T) => string | number;
  getTitle: (item: T) => string;
  getDescription?: (item: T) => string | null | undefined;
  fields?: CardField<T>[];
  badge?: (item: T) => React.ReactNode;

  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
};

export default function CardGrid<T>({
  title,
  total,
  data,
  getRowId,
  getTitle,
  getDescription,
  fields = [],
  badge,
  onAdd,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
}: CardGridProps<T>) {
  const pages = Array.from({ length: totalPages || 1 }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">Total encontrados: {total}</p>
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            Agregar
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No se encontraron datos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <div
              key={getRowId(item)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {getTitle(item)}
                  </h3>

                  {getDescription && (
                    <p className="mt-1 text-sm text-slate-500">
                      {getDescription(item) || "Sin descripción"}
                    </p>
                  )}
                </div>

                {badge && badge(item)}
              </div>

              {fields.length > 0 && (
                <div className="mt-4 space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.label}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-slate-500">{field.label}</span>
                      <span className="font-medium text-slate-700">
                        {field.render(item)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(onEdit || onDelete) && (
                <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
                    >
                      Editar
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Página {page} de {totalPages || 1} ({total} items)
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={onPrevious}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                page === pageNumber
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages || totalPages === 0}
            onClick={onNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
