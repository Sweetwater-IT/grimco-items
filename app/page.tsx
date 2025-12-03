"use client"

import { useState } from "react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Bar,
  ComposedChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// REAL DATA
import { GRIMCO_ITEMS, PURCHASE_HISTORY } from "@/lib/grimco-data"

const items = GRIMCO_ITEMS

// Build table data from real history
const generateTableData = () => {
  return items.map((item) => {
    const history = PURCHASE_HISTORY.find((h) => h.item === item.id)?.data || []
    const totalQty = history.reduce((sum, d) => sum + d.qty, 0)
    const totalSpent = history.reduce((sum, d) => sum + d.total, 0)
    const avgPrice = totalQty > 0 ? totalSpent / totalQty : 0
    const lastPurchased = history.length > 0 ? history[history.length - 1].date : "Never"

    return {
      id: item.id,
      item: item.label,
      description: item.description,
      totalSpent,
      totalQty,
      avgPrice,
      lastPurchased: lastPurch,
    }
  })
}

const tableData = generateTableData()

type SortKey = "item" | "totalSpent" | "totalQty" | "avgPrice" | "lastPurchased"
type SortConfig = { key: SortKey; direction: "asc" | "desc" } | null

export default function PriceChartPage() {
  const [selectedItem, setSelectedItem] = useState(items[0]?.id || "")
  const [open, setOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

  const chartData = PURCHASE_HISTORY.find((h) => h.item === selectedItem)?.data.map((d) => ({
    date: d.date,
    price: d.price,
    qty: d.qty,
  })) || []

  const currentItem = items.find((item) => item.id === selectedItem)
  const selectedItemData = tableData.find((item) => item.id === selectedItem)

  // Sorting logic
  const sortedTableData = [...tableData].sort((a, b) => {
    if (!sortConfig) return 0
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    )
  }

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-4">
        <Card className="border-border/40 h-[50vh] flex flex-col overflow-hidden">
          <CardHeader className="space-y-3 pb-4 flex-shrink-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Grimco Item Dashboard
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Track monthly price trends and order quantities
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <div className="flex items-center gap-4 text-xs bg-muted/40 rounded-md px-3 py-2 border border-border/40">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Total Spent
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      ${selectedItemData?.totalSpent.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Total Qty
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {selectedItemData?.totalQty.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Avg Price
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      ${selectedItemData?.avgPrice.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full md:w-[240px] justify-between font-normal bg-transparent"
                    >
                      <span className="truncate">{currentItem?.label || "Select item..."}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Search item..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                          {items.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.label}
                              onSelect={() => {
                                setSelectedItem(item.id)
                                setOpen(false)
                              }}
                              className="text-sm"
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", selectedItem === item.id ? "opacity-100" : "opacity-0")}
                              />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-blue-500" />
                <h3 className="text-base font-semibold text-foreground">{currentItem?.label}</h3>
                <span className="text-sm text-muted-foreground">·</span>
                <p className="text-sm text-muted-foreground">{currentItem?.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Price (USD)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                  }}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Quantity",
                    angle: 90,
                    position: "insideRight",
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                  }}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number, name: string) =>
                    name === "price" ? `$${value}` : `${value} units`
                  }
                  labelStyle={{ fontWeight: "500", fontSize: "12px", marginBottom: "4px" }}
                />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                <Bar
                  yAxisId="right"
                  dataKey="qty"
                  fill="#3b82f6"
                  name="Quantity"
                  radius={[3, 3, 0, 0]}
                  opacity={0.5}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  name="Price"
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">Item Inventory</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {items.length} items · Click row to view chart
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-y border-border/40 max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="w-[50px] h-9 text-xs font-medium">#</TableHead>
                    <TableHead
                      className="min-w-[180px] h-9 text-xs font-medium cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort("item")}
                    >
                      <div className="flex items-center">
                        Item {getSortIcon("item")}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[220px] h-9 text-xs font-medium">Description</TableHead>
                    <TableHead
                      className="text-right h-9 text-xs font-medium cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort("totalSpent")}
                    >
                      <div className="flex items-center justify-end">
                        Total Spent {getSortIcon("totalSpent")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right h-9 text-xs font-medium cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort("totalQty")}
                    >
                      <div className="flex items-center justify-end">
                        Total Qty {getSortIcon("totalQty")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right h-9 text-xs font-medium cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort("avgPrice")}
                    >
                      <div className="flex items-center justify-end">
                        Avg Price {getSortIcon("avgPrice")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="min-w-[110px] h-9 text-xs font-medium cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort("lastPurchased")}
                    >
                      <div className="flex items-center">
                        Last Purchased {getSortIcon("lastPurchased")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTableData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer transition-colors border-border/40",
                        selectedItem === row.id ? "bg-accent/50 hover:bg-accent/60" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedItem(row.id)}
                    >
                      <TableCell className="font-medium text-xs py-2">{index + 1}</TableCell>
                      <TableCell className="font-medium text-xs py-2">{row.item}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">{row.description}</TableCell>
                      <TableCell className="text-right font-medium text-xs py-2">
                        ${row.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs py-2">{row.totalQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs py-2">${row.avgPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-xs py-2">{row.lastPurchased}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 text-xs text-muted-foreground py-2.5 px-6 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="font-medium">
                Showing <span className="text-foreground">{items.length}</span> items
              </div>
              <div className="text-right font-medium">
                Total value:{" "}
                <span className="text-foreground">
                  ${tableData.reduce((sum, row) => sum + row.totalSpent, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
