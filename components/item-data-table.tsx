"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type ItemData = {
  id: string
  number: number
  item: string
  description: string
  totalSpent: number
  totalQty: number
  avgPrice: number
  lastPurchased: string
  priceChange: number // Replaced volatility with priceChange
  priceChangePercent: number // Added price change percentage
}

interface ItemDataTableProps {
  data: ItemData[]
  selectedItem: string
  onRowClick: (itemId: string) => void
}

export function ItemDataTable({ data, selectedItem, onRowClick }: ItemDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "number",
      desc: false,
    },
  ])

  const columns: ColumnDef<ItemData>[] = [
    {
      accessorKey: "number",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            #
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("number")}</div>,
    },
    {
      accessorKey: "item",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Item
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("item")}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "totalSpent",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center justify-end cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Spent
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("totalSpent"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "totalQty",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center justify-end cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Qty
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => {
        return <div className="text-right">{row.getValue<number>("totalQty").toLocaleString()}</div>
      },
    },
    {
      accessorKey: "avgPrice",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center justify-end cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Avg Price
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("avgPrice"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="text-right">{formatted}</div>
      },
    },
    {
      accessorKey: "priceChange",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center justify-end cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price Change
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
      cell: ({ row }) => {
        const priceChange = row.getValue<number>("priceChange")
        const priceChangePercent = row.original.priceChangePercent
        const color =
          priceChange > 0
            ? "text-red-600 dark:text-red-400"
            : priceChange < 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
        return (
          <div className={cn("text-right font-medium", color)}>
            {priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)} ({priceChange > 0 ? "+" : ""}
            {priceChangePercent}%)
          </div>
        )
      },
    },
    {
      accessorKey: "lastPurchased",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer select-none hover:bg-muted/70 transition-colors -mx-2 px-2 py-1 rounded"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Purchased
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="border-y border-border/40 max-h-[400px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9 text-xs font-medium",
                      header.id === "number" && "w-[50px]",
                      header.id === "item" && "min-w-[180px]",
                      header.id === "description" && "min-w-[220px]",
                      header.id === "lastPurchased" && "min-w-[110px]",
                      header.id === "priceChange" && "min-w-[100px]",
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "cursor-pointer transition-colors border-border/40",
                  selectedItem === row.original.id ? "bg-accent/50 hover:bg-accent/60" : "hover:bg-muted/50",
                )}
                onClick={() => onRowClick(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-xs py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
