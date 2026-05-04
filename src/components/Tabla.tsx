export type Column<T> = {
  header: string;
  accessor: keyof T;
};

type TablaProps<T> = {
  title: string;
  total: number;
  data: T[];
  columns: Column<T>[];
  getRowId: (item: T) => string | number;
  emptyMessage?: string;

  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
};

export default function Tabla<T>({
  title,
  total,
  data,
  columns,
  getRowId,
  emptyMessage = "No se encontraron datos.",
  onAdd,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
}: TablaProps<T>) {
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={String(column.accessor)} className="px-4 py-3">
                  {column.header}
                </th>
              ))}

              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right">Acciones</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data?.length &&
              data.map((item) => (
                <tr key={getRowId(item)} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className="px-4 py-3 text-slate-600"
                    >
                      {String(item[column.accessor])}
                    </td>
                  ))}

                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
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
                    </td>
                  )}
                </tr>
              ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages || 1} ({total} items)
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
