"use client"

import { useState } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, Bar, ComposedChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// IMPORT YOUR REAL DATA
import { GRIMCO_ITEMS, PURCHASE_HISTORY } from "@/lib/grimco-data"

// USE REAL DATA — DELETE ALL FAKE STUFF
const items = GRIMCO_ITEMS

// Calculate table data from real history
const tableData = items.map((item, index) => {
  const history = PURCHASE_HISTORY.find(h => h.item === item.id)?.data || []
  const totalQty = history.reduce((sum, d) => sum + d.qty, 0)
  const totalSpent = history.reduce((sum, d) => sum + d.total, 0)
  const avgPrice = history.length > 0 ? totalSpent / totalQty : 0
  const lastPurchased = history.length > 0 ? history[history.length - 1].date : "Never"

  return {
    id: item.id,
    number: index + 1,
    item: item.label,
    description: item.description,
    totalSpent: Math.round(totalSpent),
    totalQty,
    avgPrice: Math.round(avgPrice * 100) / 100,
    lastPurchased,
  }
}).sort((a, b) => b.totalSpent - a.totalSpent) // Top spenders first!

export default function PriceChartPage() {
  const [selectedItem, setSelectedItem] = useState(items[0]?.id || "")
  const [open, setOpen] = useState(false)

  // GET REAL CHART DATA
  const chartData = PURCHASE_HISTORY.find(h => h.item === selectedItem)?.data || []
  const currentItem = items.find(item => item.id === selectedItem)

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-4">
        <Card className="border-border/40 h-[50vh] flex flex-col overflow-hidden">
          <CardHeader className="space-y-3 pb-4 flex-shrink-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">Grimco Item Dashboard</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Real purchase history • Prices & quantities from actual orders
                </CardDescription>
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[380px] justify-between font-normal bg-transparent"
                  >
                    <span className="truncate text-left">
                      {currentItem ? `${currentItem.label} – ${currentItem.description}` : "Select item..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search Grimco item..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No item found.</CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.label} ${item.description}`}
                            onSelect={() => {
                              setSelectedItem(item.id)
                              setOpen(false)
                            }}
                            className="text-sm"
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedItem === item.id ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs text-muted-foreground">{item.description}</span>
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
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-1 rounded-full bg-blue-500" />
                  <h3 className="text-base font-semibold text-foreground">{currentItem.label}</h3>
                  <span className="text-sm text-muted-foreground">·</span>
                  <p className="text-sm text-muted-foreground">{currentItem.description}</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-2 flex-1 min-h-0">
            {chartData.length > 0 ? (
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
                    label={{ value: "Price (USD)", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: "Quantity", angle: 90, position: "insideRight", style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                    formatter={(value: number, name: string) => name === "price" ? `$${value.toFixed(2)}` : `${value} units`}
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="qty" fill="#3b82f6" name="Quantity" opacity={0.6} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} name="Unit Price" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No purchase history for this item
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Top Items by Total Spend</CardTitle>
            <CardDescription>{items.length} Grimco items • Sorted by money spent</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50">
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead>Last Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn("cursor-pointer", selectedItem === row.id && "bg-accent")}
                      onClick={() => setSelectedItem(row.id)}
                    >
                      <TableCell className="font-medium">{row.number}</TableCell>
                      <TableCell className="font-medium">{row.item}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-md truncate">{row.description}</TableCell>
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
          <CardFooter className="justify-between bg-muted/30">
            <div>Showing all {items.length} items</div>
            <div className="font-semibold">
              Total Spend: ${tableData.reduce((s, r) => s + r.totalSpent, 0).toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
