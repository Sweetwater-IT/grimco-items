"use client"

import { useState, useMemo } from "react"
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
  BarChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { GRIMCO_ITEMS, PURCHASE_HISTORY } from "@/lib/grimco-data"
import { ItemDataTable } from "@/components/item-data-table"

const items = GRIMCO_ITEMS.map((item) => {
  const colorPalette = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#475569", // slate/steel blue (replaced pink)
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
  ]
  const hash = item.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = colorPalette[hash % colorPalette.length]

  return {
    ...item,
    color,
  }
})

const generateItemData = (itemId: string) => {
  const itemHistory = PURCHASE_HISTORY.find((h) => h.item === itemId)

  if (itemHistory && itemHistory.data.length > 0) {
    return itemHistory.data.map((entry) => ({
      date: entry.date,
      price: entry.price,
      qty: entry.qty,
    }))
  }

  const seed = itemId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const basePrice = 100 + (seed % 1500)
  const baseQty = 20 + (seed % 200)

  return Array.from({ length: 12 }, (_, i) => {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]
    const priceVariation = Math.sin((seed + i) * 0.5) * 100
    const qtyVariation = Math.cos((seed + i) * 0.3) * 30
    return {
      date: `${month} 2024`,
      price: Math.round(basePrice + priceVariation),
      qty: Math.round(Math.max(10, baseQty + qtyVariation)),
    }
  })
}

const generateTableData = () => {
  return items.map((item, index) => {
    const itemHistory = PURCHASE_HISTORY.find((h) => h.item === item.id)

    if (itemHistory && itemHistory.data.length > 0) {
      const data = itemHistory.data
      const totalQty = data.reduce((sum, d) => sum + d.qty, 0)
      const totalSpent = data.reduce((sum, d) => sum + d.total, 0)
      const avgPrice = totalSpent / totalQty
      const lastPurchased = data[data.length - 1].date

      const firstPrice = data[0].price
      const lastPrice = data[data.length - 1].price
      const priceChange = lastPrice - firstPrice
      const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0

      return {
        id: item.id,
        number: index + 1,
        item: item.label,
        description: item.description,
        totalSpent: Math.round(totalSpent),
        totalQty,
        avgPrice: Math.round(avgPrice * 100) / 100,
        lastPurchased,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 10) / 10,
      }
    }

    const data = generateItemData(item.id)
    const totalQty = data.reduce((sum, d) => sum + d.qty, 0)
    const avgPrice = Math.round(data.reduce((sum, d) => sum + d.price, 0) / data.length)
    const totalSpent = Math.round(data.reduce((sum, d) => sum + d.price * d.qty, 0))
    const lastPurchased = data[data.length - 1].date

    const firstPrice = data[0].price
    const lastPrice = data[data.length - 1].price
    const priceChange = lastPrice - firstPrice
    const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0

    return {
      id: item.id,
      number: index + 1,
      item: item.label,
      description: item.description,
      totalSpent,
      totalQty,
      avgPrice,
      lastPurchased,
      priceChange: Math.round(priceChange * 100) / 100,
      priceChangePercent: Math.round(priceChangePercent * 10) / 10,
    }
  })
}

const generateMonthlyAnalysis = () => {
  const monthlyData: Record<
    string,
    {
      totalSpent: number
      items: Map<
        string,
        { itemName: string; oldPrice?: number; newPrice?: number; priceChange: number; priceChangePercent: number }
      >
    }
  > = {}

  PURCHASE_HISTORY.forEach((itemHistory) => {
    const item = GRIMCO_ITEMS.find((i) => i.id === itemHistory.item)
    if (!item) return

    itemHistory.data.forEach((purchase, index) => {
      const date = new Date(purchase.date)
      const monthKey = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalSpent: 0, items: new Map() }
      }

      monthlyData[monthKey].totalSpent += purchase.total

      if (index > 0) {
        const prevPrice = itemHistory.data[index - 1].price
        const currentPrice = purchase.price
        const priceChange = currentPrice - prevPrice
        const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0

        const existingItem = monthlyData[monthKey].items.get(itemHistory.item)
        if (!existingItem || Math.abs(priceChangePercent) > Math.abs(existingItem.priceChangePercent)) {
          monthlyData[monthKey].items.set(itemHistory.item, {
            itemName: item.label,
            oldPrice: prevPrice,
            newPrice: currentPrice,
            priceChange,
            priceChangePercent,
          })
        }
      }
    })
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      totalSpent: Math.round(data.totalSpent),
      topPriceChanges: Array.from(data.items.entries())
        .map(([itemId, itemData]) => ({ itemId, ...itemData }))
        .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
        .slice(0, 10),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}

export default function PriceChartPage() {
  const [selectedItem, setSelectedItem] = useState(items[0].id)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("items")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const chartData = generateItemData(selectedItem)
  const currentItem = items.find((item) => item.id === selectedItem)
  const selectedItemData = generateTableData().find((item) => item.id === selectedItem)

  const { priceDomain, qtyDomain } = useMemo(() => {
    const prices = chartData.map((d) => d.price)
    const quantities = chartData.map((d) => d.qty)

    const maxPrice = Math.max(...prices)
    const maxQty = Math.max(...quantities)

    const priceRange = maxPrice
    const qtyRange = maxQty

    const pricePadding = priceRange === 0 ? maxPrice : priceRange * 0.5
    const qtyPadding = qtyRange === 0 ? maxQty : qtyRange * 0.5

    return {
      priceDomain: [0, Math.ceil(maxPrice + pricePadding)],
      qtyDomain: [0, Math.ceil(maxQty + qtyPadding)],
    }
  }, [chartData])

  const tableData = generateTableData()
  const monthlyAnalysis = useMemo(() => generateMonthlyAnalysis(), [])

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="items">Item Analysis</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4 mt-4">
            <Card className="border-border/40 h-[70vh] flex flex-col overflow-hidden">
              <CardHeader className="space-y-3 pb-4 flex-shrink-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">ETC Grimco Item Dashboard</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Track monthly price trends and order quantities
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start">
                    <div className="flex items-center gap-4 text-xs bg-muted/40 rounded-md px-3 py-2 border border-border/40">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Spent</span>
                        <span className="font-semibold text-sm text-foreground">
                          ${selectedItemData?.totalSpent.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-border/60" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Qty</span>
                        <span className="font-semibold text-sm text-foreground">
                          {selectedItemData?.totalQty.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-border/60" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Price</span>
                        <span className="font-semibold text-sm text-foreground">
                          ${selectedItemData?.avgPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-border/60" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Price Change</span>
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            selectedItemData?.priceChange && selectedItemData.priceChange > 0
                              ? "text-red-600"
                              : selectedItemData?.priceChange && selectedItemData.priceChange < 0
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                          )}
                        >
                          {selectedItemData?.priceChange
                            ? `${selectedItemData.priceChange > 0 ? "+" : ""}$${selectedItemData.priceChange.toLocaleString()} (${selectedItemData.priceChangePercent > 0 ? "+" : ""}${selectedItemData.priceChangePercent}%)`
                            : "N/A"}
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
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedItem === item.id ? "opacity-100" : "opacity-0",
                                    )}
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
                    <div className="h-3 w-1 rounded-full" style={{ backgroundColor: currentItem?.color }} />
                    <h3 className="text-base font-semibold text-foreground">{currentItem?.label}</h3>
                    <span className="text-sm text-muted-foreground">·</span>
                    <p className="text-sm text-muted-foreground">{currentItem?.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.7}
                      vertical={true}
                      horizontal={true}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      padding={{ left: chartData.length === 1 ? 100 : 20, right: chartData.length === 1 ? 100 : 20 }}
                    />

                    <YAxis
                      yAxisId="left"
                      domain={qtyDomain}
                      label={{
                        value: "Quantity",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                      }}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={priceDomain}
                      label={{
                        value: "Price (USD)",
                        angle: 90,
                        position: "insideRight",
                        style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                      }}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null
                        return (
                          <div className="bg-popover border border-border rounded-md shadow-lg p-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full bg-current"
                                  style={{ color: currentItem?.color }}
                                />
                                <span className="text-xs font-medium text-muted-foreground">Price</span>
                                <span className="text-sm font-semibold ml-auto">${payload[0]?.value}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full bg-current opacity-50"
                                  style={{ color: currentItem?.color }}
                                />
                                <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                                <span className="text-sm font-semibold ml-auto">{payload[1]?.value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />

                    <Bar
                      yAxisId="right"
                      dataKey="price"
                      fill={currentItem?.color}
                      name="Price"
                      radius={[3, 3, 0, 0]}
                      opacity={0.7}
                      maxBarSize={60}
                      minPointSize={5}
                      barSize={chartData.length === 1 ? 60 : undefined}
                    />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="qty"
                      stroke={currentItem?.color}
                      strokeWidth={2.5}
                      name="Quantity"
                      dot={{ fill: currentItem?.color, r: 4 }}
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
                    <CardDescription className="text-xs">Complete list of all items</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ItemDataTable data={tableData} selectedItem={selectedItem} onRowClick={setSelectedItem} />
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
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-4">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Monthly Spend Analysis</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Hover over a bar to view top 10 price changes for that month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.7}
                      vertical={true}
                      horizontal={true}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null
                        const monthData = payload[0]?.payload
                        const topChanges = monthData?.topPriceChanges || []

                        return (
                          <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-4 min-w-[400px] max-w-[500px]">
                            <div className="font-semibold text-sm mb-1 text-foreground">{monthData?.month}</div>
                            <div className="text-xs text-muted-foreground">Total Spent</div>
                            <div className="text-lg font-bold text-foreground mb-3">
                              ${payload[0]?.value?.toLocaleString()}
                            </div>

                            {topChanges.length > 0 && (
                              <>
                                <div className="border-t border-border pt-3 mt-2">
                                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                    Top 10 Price Changes
                                  </div>
                                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                                    {topChanges.map((change: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between gap-3 text-xs py-1.5 px-2 rounded hover:bg-accent/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            #{idx + 1}
                                          </span>
                                          <span className="font-medium truncate">{change.itemName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-[10px] text-muted-foreground">
                                            ${change.oldPrice.toFixed(2)} → ${change.newPrice.toFixed(2)}
                                          </span>
                                          <span
                                            className={cn(
                                              "font-semibold text-xs",
                                              change.priceChangePercent > 0 ? "text-red-600" : "text-emerald-600",
                                            )}
                                          >
                                            {change.priceChangePercent > 0 ? "+" : ""}
                                            {change.priceChangePercent.toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      }}
                    />
                    <Bar
                      dataKey="totalSpent"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                      activeBar={{ fill: "#2563eb", stroke: "#1e40af", strokeWidth: 1 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
