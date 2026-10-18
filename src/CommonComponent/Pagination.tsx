import React, { useMemo } from "react"

export interface PaginationProps {
  // New props
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  label?: string

  // Legacy props
  currentPage?: number
  totalPages?: number
  goToPage?: (page: number) => void
  goToNextPage?: () => void
  goToPreviousPage?: () => void
  itemsPerPage?: number
  setItemsPerPage?: ((pageSize: number) => void) | React.Dispatch<React.SetStateAction<number>>
  itemsPerPageOptions?: number[]
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const rawPage = props.page ?? props.currentPage ?? 1
  const pageSize = props.pageSize ?? props.itemsPerPage ?? 10
  const onPageChange = props.onPageChange ?? props.goToPage ?? (() => {})
  const label = props.label ?? "Items"

  const totalPages = useMemo(() => {
    if (props.totalPages !== undefined) return props.totalPages
    if (props.total !== undefined) return Math.ceil(props.total / pageSize)
    return 1
  }, [props.totalPages, props.total, pageSize])

  const safePage = Math.min(
    Math.max(rawPage, 1),
    Math.max(totalPages, 1)
  )

  const hasActualTotal = props.total !== undefined
  const total = props.total ?? totalPages * pageSize

  const pages = useMemo(() => {
    if (totalPages <= 1) return [1]

    const windowSize = 2
    const result: number[] = []

    const startPage = Math.max(1, safePage - windowSize)
    const endPage = Math.min(totalPages, safePage + windowSize)

    for (let i = startPage; i <= endPage; i++) {
      result.push(i)
    }

    return result
  }, [safePage, totalPages])

  if (
    totalPages <= 1 &&
    !props.itemsPerPageOptions &&
    (props.total === undefined || props.total <= pageSize)
  ) {
    return null
  }

  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, total)
  const lastPage = pages.at(-1)

  const summaryText = hasActualTotal
    ? `Showing ${start} to ${end} of ${total} ${label}`
    : `Page ${safePage} of ${totalPages}`

  return (
    <nav
      aria-label="Pagination"
      className="w-full flex flex-wrap items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-200 shrink-0 gap-2"
    >
      <div className="flex items-center gap-4">
        {props.itemsPerPageOptions && props.setItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => props.setItemsPerPage?.(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {props.itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>{summaryText}</div>
      </div>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => {
            if (props.goToPreviousPage) {
              props.goToPreviousPage()
            } else {
              onPageChange(safePage - 1)
            }
          }}
          className="px-2.5 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 text-xs sm:text-sm"
        >
          Previous
        </button>

        {/* First page + left ellipsis */}
        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="px-2.5 py-1 border rounded hover:bg-gray-50 text-xs sm:text-sm"
            >
              1
            </button>
            {pages[0] > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map((p) => (
          <button
            type="button"
            key={p}
            disabled={p === safePage}
            onClick={() => onPageChange(p)}
            className={`px-2.5 py-1 border rounded text-xs sm:text-sm transition ${
              p === safePage
                ? "bg-blue-600 text-white font-medium cursor-default"
                : "hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Right ellipsis + last page */}
        {lastPage !== undefined && lastPage < totalPages && (
          <>
            {lastPage < totalPages - 1 && (
              <span className="px-1 text-gray-400">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="px-2.5 py-1 border rounded hover:bg-gray-50 text-xs sm:text-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => {
            if (props.goToNextPage) {
              props.goToNextPage()
            } else {
              onPageChange(safePage + 1)
            }
          }}
          className="px-2.5 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 text-xs sm:text-sm"
        >
          Next
        </button>
      </div>
    </nav>
  )
}

export default Pagination