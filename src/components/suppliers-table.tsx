"use client";

import { useState } from "react";
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
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import type { SupplierItem } from "@/lib/types";
import { formatYen, formatYenDecimal } from "@/lib/format";

function SortIcon({ column }: { column: { getIsSorted: () => false | "asc" | "desc" } }) {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="ml-1 size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 size-3.5" />;
  return <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />;
}

const columns: ColumnDef<SupplierItem>[] = [
  {
    accessorKey: "supplier_code",
    header: ({ column }) => (
      <button
        className="flex items-center font-semibold text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        コード
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("supplier_code")}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
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
      <span className="font-medium max-w-[300px] truncate block">
        {row.getValue("product_name")}
      </span>
    ),
  },
  {
    accessorKey: "category_name",
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
      <Badge variant="secondary">{row.getValue("category_name")}</Badge>
    ),
    filterFn: (row, id, value) => {
      if (!value || value === "__all__") return true;
      return row.getValue<string>(id) === value;
    },
  },
  {
    accessorKey: "spec",
    header: () => (
      <span className="font-semibold text-xs uppercase tracking-wider">規格</span>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("spec")}</span>
    ),
  },
  {
    accessorKey: "case_quantity",
    header: ({ column }) => (
      <button
        className="flex items-center font-semibold text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        入数
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-center block font-medium">
        {row.getValue("case_quantity")}
      </span>
    ),
  },
  {
    accessorKey: "wholesale_price",
    header: ({ column }) => (
      <button
        className="flex items-center font-semibold text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        納入価格
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {formatYen(row.getValue("wholesale_price"))}
      </span>
    ),
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => (
      <button
        className="flex items-center font-semibold text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        単価
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => {
      const wholesale = row.original.wholesale_price;
      const qty = row.original.case_quantity;
      const calculated = qty > 0 ? wholesale / qty : 0;
      return (
        <span className="tabular-nums font-medium">
          {formatYenDecimal(calculated)}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const calcA =
        rowA.original.case_quantity > 0
          ? rowA.original.wholesale_price / rowA.original.case_quantity
          : 0;
      const calcB =
        rowB.original.case_quantity > 0
          ? rowB.original.wholesale_price / rowB.original.case_quantity
          : 0;
      return calcA - calcB;
    },
  },
  {
    accessorKey: "last_shipped",
    header: ({ column }) => (
      <button
        className="flex items-center font-semibold text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        最新出荷日
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => {
      const val = row.getValue<string | null>("last_shipped");
      return (
        <span className={val ? "text-sm tabular-nums" : "text-sm text-muted-foreground"}>
          {val ?? "\u2014"}
        </span>
      );
    },
  },
];

interface SuppliersTableProps {
  items: SupplierItem[];
  categories: { code: string; name: string }[];
}

export function SuppliersTable({ items, categories }: SuppliersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: items,
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
      const name = row.original.product_name.toLowerCase();
      const code = row.original.supplier_code.toLowerCase();
      const search = filterValue.toLowerCase();
      return name.includes(search) || code.includes(search);
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
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
            value={(table.getColumn("category_name")?.getFilterValue() as string) ?? "__all__"}
            onValueChange={(value) => {
              table.getColumn("category_name")?.setFilterValue(
                value === "__all__" ? undefined : value
              );
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="カテゴリで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべてのカテゴリ</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.code} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
            {filteredCount} 件
          </span>
        </div>
      </div>

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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tabular-nums">
          {filteredCount} 件中 {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
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
    </div>
  );
}
