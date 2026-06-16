export type Column<T> = {
  header: string;
  accessor: keyof T;
  customLabelFn?: (columnValue: any, tableData: T[]) => any;
  children?: Column<T>[];
  /** Clases extra para th/td (ej. hidden lg:table-cell) */
  className?: string;
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
  editLabel?: string;
  showEditButtonCondition?: (item: T) => boolean;
  onDelete?: (item: T) => void;
  deleteLabel?: string;
  showDeleteButtonCondition?: (item: T) => boolean;

  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  addButtonClassName?: string;
  paginationActiveClassName?: string;
  customActionClassName?: string;
  customAction?: {
    label: (tableElement: T) => string;
    actionCallback: (tableElement: T) => any;
  };
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
  editLabel = "Editar",
  showEditButtonCondition = () => true,
  onDelete,
  deleteLabel = "Eliminar",
  showDeleteButtonCondition = () => true,
  page,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
  addButtonClassName = "rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200",
  paginationActiveClassName = "bg-blue-600 text-white",
  customActionClassName = "rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200",
  customAction,
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
          <button type="button" onClick={onAdd} className={addButtonClassName}>
            Agregar
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className={`whitespace-nowrap px-3 py-3 sm:px-4 ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}

              {(onEdit || onDelete || customAction) && (
                <th className="px-4 py-3 text-right">Acciones</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data &&
              data.map((item) => (
                <tr key={getRowId(item)} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className={`px-3 py-3 text-slate-600 sm:px-4 ${column.className ?? ""}`}
                    >
                      {column.customLabelFn
                        ? column.customLabelFn(item[column.accessor], data)
                        : String(item[column.accessor])}
                    </td>
                  ))}

                  {(onEdit || onDelete || customAction) && (
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                        {onEdit && showEditButtonCondition(item) && (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="rounded-lg bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200 sm:px-3 sm:text-sm"
                          >
                            {editLabel}
                          </button>
                        )}

                        {onDelete && showDeleteButtonCondition(item) && (
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 sm:px-3 sm:text-sm"
                          >
                            {deleteLabel}
                          </button>
                        )}

                        {customAction && customAction.label(item) && (
                          <button
                            type="button"
                            onClick={() => customAction.actionCallback(item)}
                            className={`${customActionClassName} px-2 py-1 text-xs sm:px-3 sm:text-sm`}
                          >
                            {customAction.label(item)}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

            {data?.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onEdit || onDelete || customAction ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Pág. {page} de {totalPages || 1} ({total} items)
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
                  ? paginationActiveClassName
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
