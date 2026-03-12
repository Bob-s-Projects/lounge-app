"use client";

import { useState, useMemo } from "react";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
  Info,
} from "lucide-react";
import type { Product } from "@/lib/types";
import type { CostMatch, MatchType } from "@/lib/cost-matching";
import { formatYen } from "@/lib/format";

// ── Extended row type ──

type ProductRow = Product & {
  estimated_cost: number;
  estimated_cost_ratio: number;
  match_type: MatchType;
  match_details: string;
  supplier_items: string[];
};

// ── Sort icon ──

function SortIcon({ column }: { column: { getIsSorted: () => false | "asc" | "desc" } }) {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="ml-1 size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 size-3.5" />;
  return <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />;
}

// ── Cost ratio badges ──

function CostRatioBadge({ value, cost }: { value: number | null; cost: number }) {
  if (cost === 0 || value === null) {
    return (
      <span className="text-xs text-muted-foreground">
        未設定
      </span>
    );
  }
  const pct = value * 100;
  const label = `${pct.toFixed(1)}%`;

  if (pct < 30) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        {label}
      </span>
    );
  }
  if (pct <= 40) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
      {label}
    </span>
  );
}

function EstimatedCostRatioBadge({ ratio, matchType }: { ratio: number; matchType: MatchType }) {
  if (matchType === "unmatched" || ratio === 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300/50 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20">
        --
      </span>
    );
  }
  const pct = ratio * 100;
  const label = `${pct.toFixed(1)}%`;

  if (pct < 25) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        {label}
      </span>
    );
  }
  if (pct <= 35) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
      {label}
    </span>
  );
}

function MatchTypeBadge({ type }: { type: MatchType }) {
  switch (type) {
    case "direct":
      return (
        <Badge variant="default" className="text-[10px] px-1.5 py-0">
          直接
        </Badge>
      );
    case "recipe":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          レシピ
        </Badge>
      );
    case "unmatched":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
          未マッチ
        </Badge>
      );
  }
}

// ── Column definitions ──

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "product_code",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        商品コード
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("product_code")}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        商品名
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("product_name")}</span>
    ),
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
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
    accessorKey: "price",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        販売価格
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{formatYen(row.getValue("price"))}</span>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        POS原価
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => {
      const cost = row.getValue<number>("cost");
      if (cost === 0) {
        return <span className="text-xs text-muted-foreground">未設定</span>;
      }
      return <span className="tabular-nums">{formatYen(cost)}</span>;
    },
  },
  {
    accessorKey: "cost_ratio",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        POS原価率
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <CostRatioBadge
        value={row.getValue("cost_ratio")}
        cost={row.original.cost}
      />
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.cost_ratio ?? -1;
      const b = rowB.original.cost_ratio ?? -1;
      return a - b;
    },
  },
  {
    accessorKey: "estimated_cost",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        推定原価
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => {
      const cost = row.original.estimated_cost;
      const matchType = row.original.match_type;
      const details = row.original.match_details;

      if (matchType === "unmatched" || cost === 0) {
        return <span className="text-xs text-muted-foreground">--</span>;
      }

      return (
        <Tooltip>
          <TooltipTrigger className="tabular-nums cursor-help inline-flex items-center gap-1">
            {formatYen(cost)}
            <Info className="size-3 text-muted-foreground/60" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{details}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.estimated_cost - rowB.original.estimated_cost;
    },
  },
  {
    accessorKey: "estimated_cost_ratio",
    header: ({ column }) => (
      <button
        className="flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        推定原価率
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <EstimatedCostRatioBadge
        ratio={row.original.estimated_cost_ratio}
        matchType={row.original.match_type}
      />
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.match_type === "unmatched" ? -1 : rowA.original.estimated_cost_ratio;
      const b = rowB.original.match_type === "unmatched" ? -1 : rowB.original.estimated_cost_ratio;
      return a - b;
    },
  },
  {
    accessorKey: "match_type",
    header: "マッチ種別",
    cell: ({ row }) => <MatchTypeBadge type={row.original.match_type} />,
    filterFn: (row, _id, value) => {
      if (!value || value === "__all__") return true;
      return row.original.match_type === value;
    },
  },
  {
    accessorKey: "display_flag",
    header: "表示",
    cell: ({ row }) => {
      const flag = row.getValue<string>("display_flag");
      return flag === "1" ? (
        <Eye className="size-4 text-emerald-600" />
      ) : (
        <EyeOff className="size-4 text-muted-foreground/40" />
      );
    },
  },
];

// ── Table component ──

interface ProductsTableProps {
  products: Product[];
  categories: string[];
  costMatches: CostMatch[];
}

export function ProductsTable({ products, categories, costMatches }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Merge products with cost match data
  const data = useMemo<ProductRow[]>(() => {
    const matchMap = new Map<string, CostMatch>();
    for (const m of costMatches) {
      matchMap.set(m.product_id, m);
    }
    return products.map((p) => {
      const match = matchMap.get(p.product_id);
      return {
        ...p,
        estimated_cost: match?.estimated_cost ?? 0,
        estimated_cost_ratio: match?.cost_ratio ?? 0,
        match_type: match?.match_type ?? ("unmatched" as MatchType),
        match_details: match?.match_details ?? "未マッチ",
        supplier_items: match?.supplier_items ?? [],
      };
    });
  }, [products, costMatches]);

  const table = useReactTable({
    data,
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
      const code = row.original.product_code.toLowerCase();
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
    <TooltipProvider>
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
              value={(table.getColumn("match_type")?.getFilterValue() as string) ?? "__all__"}
              onValueChange={(value) => {
                table.getColumn("match_type")?.setFilterValue(
                  value === "__all__" ? undefined : value
                );
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="マッチ種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべてのマッチ</SelectItem>
                <SelectItem value="direct">直接マッチ</SelectItem>
                <SelectItem value="recipe">レシピマッチ</SelectItem>
                <SelectItem value="unmatched">未マッチ</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredCount} 件
            </span>
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
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
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
          <p className="text-sm text-muted-foreground">
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
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mx-2 text-sm text-muted-foreground">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
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
    </TooltipProvider>
  );
}
