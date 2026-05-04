type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type TablaProps<T> = {
  title: string;
  total: number;
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  getRowId: (item: T) => string | number;
  renderActions?: (item: T) => React.ReactNode;
  pagination: {
    page: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
    onPageChange: (page: number) => void;
  };
};

export default function Tabla<T>({
  title,
  total,
  data,
  columns,
  emptyMessage = "No se encontraron registros.",
  getRowId,
  renderActions,
  pagination,
}: TablaProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="flex flex-row border-b justify-between items-center border-slate-200 p-5 ">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">Total encontrados: {total}</p>
        </div>
        <button className="rounded-lg bg-blue-100 px-2 py-1 h-fit font-medium text-blue-700 hover:bg-blue-200">
          Agregar
        </button>
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

              {renderActions && (
                <th className="px-4 py-3 text-right">Acciones</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={getRowId(item)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={String(column.accessor)}
                    className={`px-4 py-3 text-slate-600 ${
                      column.className ?? ""
                    }`}
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.accessor])}
                  </td>
                ))}

                {renderActions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {renderActions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
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
          Page {pagination.page} of {pagination.totalPages || 1} ({total} items)
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagination.page === 1}
            onClick={pagination.onPrevious}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {Array.from(
            { length: pagination.totalPages || 1 },
            (_, index) => index + 1,
          )
            .filter((page) => {
              const totalPages = pagination.totalPages || 1;
              const currentPage = pagination.page;

              return (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
              );
            })
            .map((page, index, array) => {
              const previousPage = array[index - 1];
              const showDots = previousPage && page - previousPage > 1;

              return (
                <div key={page}>
                  {showDots && <span className="px-2 text-slate-500">...</span>}

                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition
                ${
                  pagination.page === page
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}

          <button
            type="button"
            disabled={
              pagination.page === pagination.totalPages ||
              pagination.totalPages === 0
            }
            onClick={pagination.onNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
