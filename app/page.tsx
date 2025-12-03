"use client"

import { useState, useMemo } from "react"
import {
  Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, Bar, ComposedChart
} from "recharts"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

import { GRIMCO_ITEMS, PURCHASE_HISTORY } from "@/lib/grimco-data"

const items = GRIMCO_ITEMS

// Define table row type first (fixes the TypeScript error)
type TableRowData = {
  id: string
  itemCode: string
  description: string
  totalSpent: number
  totalQty: number
  avgPrice: number
  lastPurchased: string
}

export default function PriceChartPage() {
  const [selectedItem, setSelectedItem] = useState(items[0]?.id || "")
  const [open, setOpen] = useState(false)
  const [sortCol, setSortCol] = useState<keyof TableRowData | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const currentItem = items.find(i => i.id === selectedItem)
  const rawHistory = PURCHASE_HISTORY.find(h => h.item === selectedItem)?.data || []

  const chartData = rawHistory.map(d => ({
    date: d.date,
    qty: d.qty,
    price: d.price,
    totalSpend: d.total,
  }))

  const totalQty = rawHistory.reduce((s, d) => s + d.qty, 0)
  const totalSpent = rawHistory.reduce((s, d) => s + d.total, 0)
  const avgPrice = totalQty > 0 ? totalSpent / totalQty : 0

  // Table data
  const rawTableData: TableRowData[] = items.map(item => {
    const h = PURCHASE_HISTORY.find(x => x.item === item.id)?.data || []
    const qty = h.reduce((s, d) => s + d.qty, 0)
    const spent = h.reduce((s, d) => s + d.total, 0)
    const avg = qty > 0 ? spent / qty : 0
    const last = h.length > 0 ? h[h.length - 1].date : "Never"
    return {
      id: item.id,
      itemCode: item.label,
      description: item.description,
      totalSpent: Math.round(spent),
      totalQty: qty,
      avgPrice: Number(avg.toFixed(2)),
      lastPurchased: last
    }
  })

  const tableData = useMemo(() => {
    if (!sortCol) return rawTableData
    return [...rawTableData].sort((a, b) => {
      const aVal = a[sortCol], bVal = b[sortCol]
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [sortCol, sortDir, rawTableData])

  const handleSort = (col: keyof TableRowData) => {
    if (sortCol === col) setSortDir(prev => prev === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("desc") }
  }

  const SortIcon = ({ col }: { col: keyof TableRowData }) => (
    <ArrowUpDown className={cn("ml-2 h-3 w-3", sortCol === col && sortDir === "asc" && "rotate-180")} />
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-2xl">Grimco Purchase Analyzer</CardTitle>
                <CardDescription>Real daily history • Total spend, quantity & unit price</CardDescription>
              </div>

              <div className="flex items-center gap-6 text-sm bg-muted/50 rounded-lg px-5 py-3 border">
                <div className="text-center">
                  <div className="text-[10px] uppercase text-muted-foreground">Total Spent</div>
                  <div className="font-bold text-lg">${totalSpent.toLocaleString()}</div>
                </div>
                <div className="h-10 w-px bg-border/60" />
                <div className="text-center">
                  <div className="text-[10px] uppercase text-muted-foreground">Total Qty</div>
                  <div className="font-bold text-lg">{totalQty.toLocaleString()}</div>
                </div>
                <div className="h-10 w-px bg-border/60" />
                <div className="text-center">
                  <div className="text-[10px] uppercase text-muted-foreground">Avg Price</div>
                  <div className="font-bold text-lg">${avgPrice.toFixed(2)}</div>
                </div>
              </div>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-96 justify-between">
                    <span className="truncate text-left">
                      {currentItem ? `${currentItem.label} – ${currentItem.description}` : "Select item..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0">
                  <Command>
                    <CommandInput placeholder="Search Grimco item..." />
                    <CommandList>
                      <CommandEmpty>No item found.</CommandEmpty>
                      <CommandGroup>
                        {items.map(item => (
                          <CommandItem key={item.id} value={`${item.label} ${item.description}`} onSelect={() => { setSelectedItem(item.id); setOpen(false) }}>
                            <Check className={cn("mr-2 h-4 w-4", selectedItem === item.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {currentItem && (
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-1 rounded-full bg-blue-500" />
                  <h3 className="text-lg font-semibold">{currentItem.label}</h3>
                  <span className="text-muted-foreground">·</span>
                  <p className="text-sm text-muted-foreground">{currentItem.description}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="h-96">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={v => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(v: number, name: string) => 
                      name === "totalSpend" || name === "price" ? `$${v.toFixed(2)}` : `${v} units`
                    }
                    labelFormatter={label => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="qty" fill="#10b981" name="Quantity" opacity={0.7} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="totalSpend" stroke="#f59e0b" strokeWidth={3} name="Total Spent" dot={{ r: 5 }} />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} name="Unit Price" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No purchase history for this item
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Grimco Items</CardTitle>
            <CardDescription>{items.length} items • Click headers to sort</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-screen overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("itemCode")}>
                      Item Code {sortCol === "itemCode" && <SortIcon col="itemCode" />}
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort("totalSpent")}>
                      Total Spent {sortCol === "totalSpent" && <SortIcon col="totalSpent" />}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort("totalQty")}>
                      Total Qty {sortCol === "totalQty" && <SortIcon col="totalQty" />}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort("avgPrice")}>
                      Avg Price {sortCol === "avgPrice" && <SortIcon col="avgPrice" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("lastPurchased")}>
                      Last Purchase {sortCol === "lastPurchased" && <SortIcon col="lastPurchased" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      className={cn("cursor-pointer hover:bg-muted/50", selectedItem === row.id && "bg-accent")}
                      onClick={() => setSelectedItem(row.id)}
                    >
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{row.itemCode}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md truncate">{row.description}</TableCell>
                      <TableCell className="text-right font-medium">${row.totalSpent.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.totalQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.avgPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{row.lastPurchased}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 justify-between">
            <div>Showing all {items.length} items</div>
            <div className="font-bold">
              Grand Total: ${tableData.reduce((s, r) => s + r.totalSpent, 0).toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
