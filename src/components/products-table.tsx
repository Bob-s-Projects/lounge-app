"use client"

import { useState, useTransition } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Plus,
} from "lucide-react"
import type { SupabaseProduct } from "@/app/products/actions"
import { deleteProduct, toggleProductActive } from "@/app/products/actions"
import { ProductForm } from "@/components/product-form"
import { formatYen } from "@/lib/format"

// ── Sort icon ──

function SortIcon({ column }: { column: { getIsSorted: () => false | "asc" | "desc" } }) {
  const sorted = column.getIsSorted()
  if (sorted === "asc") return <ArrowUp className="ml-1 size-3.5" />
  if (sorted === "desc") return <ArrowDown className="ml-1 size-3.5" />
  return <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />
}

// ── Cost ratio badge ──

function CostRatioBadge({ value }: { value: number | null }) {
  if (value === null || value === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        未設定
      </span>
    )
  }
  const pct = Number(value)
  const label = `${pct.toFixed(1)}%`

  if (pct < 30) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        {label}
      </span>
    )
  }
  if (pct <= 40) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
      {label}
    </span>
  )
}

// ── Active badge ──

function ActiveBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        <Eye className="size-3" />
        有効
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300/50 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20">
      <EyeOff className="size-3" />
      無効
    </span>
  )
}

// ── Column definitions ──

function createColumns(
  onEdit: (product: SupabaseProduct) => void,
  onDelete: (product: SupabaseProduct) => void,
  onToggleActive: (product: SupabaseProduct) => void,
  togglingId: number | null
): ColumnDef<SupabaseProduct>[] {
  return [
    {
      accessorKey: "product_code",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          商品コード
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.product_code ?? "--"}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          商品名
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          カテゴリ
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.category}</Badge>
      ),
      filterFn: (row, _id, value) => {
        if (!value || value === "__all__") return true
        return row.original.category === value
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          販売価格
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatYen(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "cost",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          原価
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => {
        const cost = row.original.cost
        if (cost === 0) {
          return <span className="text-xs text-muted-foreground">未設定</span>
        }
        return <span className="tabular-nums font-medium">{formatYen(cost)}</span>
      },
    },
    {
      accessorKey: "cost_ratio",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          原価率
          <SortIcon column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <CostRatioBadge value={row.original.cost_ratio} />
      ),
      sortingFn: (rowA, rowB) => {
        const a = Number(rowA.original.cost_ratio ?? -1)
        const b = Number(rowB.original.cost_ratio ?? -1)
        return a - b
      },
    },
    {
      accessorKey: "is_active",
      header: () => (
        <span className="font-semibold text-xs uppercase tracking-wider">ステータス</span>
      ),
      cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
      filterFn: (row, _id, value) => {
        if (!value || value === "__all__") return true
        if (value === "active") return row.original.is_active
        if (value === "inactive") return !row.original.is_active
        return true
      },
    },
    {
      id: "actions",
      header: () => (
        <span className="font-semibold text-xs uppercase tracking-wider">操作</span>
      ),
      cell: ({ row }) => {
        const product = row.original
        const isToggling = togglingId === product.id
        return (
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(product)}
                  />
                }
              >
                <Pencil className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>編集</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onToggleActive(product)}
                    disabled={isToggling}
                  />
                }
              >
                {isToggling ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : product.is_active ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {product.is_active ? "無効にする" : "有効にする"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(product)}
                    className="text-destructive hover:text-destructive"
                  />
                }
              >
                <Trash2 className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>削除</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  ]
}

// ── Table component ──

interface ProductsTableProps {
  products: SupabaseProduct[]
  categories: string[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // CRUD state
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupabaseProduct | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const handleEdit = (product: SupabaseProduct) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const handleDelete = (product: SupabaseProduct) => {
    setDeleteTarget(product)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  const handleToggleActive = (product: SupabaseProduct) => {
    setTogglingId(product.id)
    toggleProductActive(product.id, !product.is_active).finally(() => {
      setTogglingId(null)
    })
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleActive, togglingId)

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = row.original.name.toLowerCase()
      const code = (row.original.product_code ?? "").toLowerCase()
      const search = filterValue.toLowerCase()
      return name.includes(search) || code.includes(search)
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="商品名・コードで検索..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={(table.getColumn("category")?.getFilterValue() as string) ?? "__all__"}
              onValueChange={(value) => {
                table.getColumn("category")?.setFilterValue(
                  value === "__all__" ? undefined : value
                )
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべてのカテゴリ</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn("is_active")?.getFilterValue() as string) ?? "__all__"}
              onValueChange={(value) => {
                table.getColumn("is_active")?.setFilterValue(
                  value === "__all__" ? undefined : value
                )
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべて</SelectItem>
                <SelectItem value="active">有効のみ</SelectItem>
                <SelectItem value="inactive">無効のみ</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
              {filteredCount} 件
            </span>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              新規商品
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow key={row.id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    該当する商品がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground tabular-nums">
            {filteredCount} 件中{" "}
            {filteredCount > 0
              ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
              : 0}
            {" - "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredCount
            )}{" "}
            件を表示
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mx-2 text-sm text-muted-foreground tabular-nums">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Create/Edit dialog */}
        <ProductForm
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editingProduct}
          categories={categories}
        />

        {/* Delete confirmation dialog */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>商品を削除</DialogTitle>
              <DialogDescription>
                本当に削除しますか？この操作は取り消せません。
              </DialogDescription>
            </DialogHeader>
            {deleteTarget && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium">{deleteTarget.name}</p>
                <p className="text-sm text-muted-foreground">
                  {deleteTarget.category} / {formatYen(deleteTarget.price)}
                </p>
              </div>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                キャンセル
              </DialogClose>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="size-4 animate-spin" />}
                削除する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
