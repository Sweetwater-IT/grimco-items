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

const items = [
  {
    id: "laptop-dell-xps-13",
    label: "Dell XPS 13",
    color: "#3b82f6",
    description: "13-inch ultrabook with Intel Core i7",
  },
  { id: "laptop-macbook-pro-14", label: "MacBook Pro 14", color: "#3b82f6", description: "14-inch M3 Pro MacBook" },
  {
    id: "laptop-lenovo-thinkpad-x1",
    label: "Lenovo ThinkPad X1",
    color: "#3b82f6",
    description: "Business laptop with Intel Core i7",
  },
  {
    id: "laptop-hp-spectre-x360",
    label: "HP Spectre x360",
    color: "#3b82f6",
    description: "Convertible 2-in-1 laptop",
  },
  { id: "laptop-asus-zenbook-14", label: "ASUS ZenBook 14", color: "#3b82f6", description: "Thin and light laptop" },
  { id: "phone-iphone-15-pro", label: "iPhone 15 Pro", color: "#8b5cf6", description: "Apple flagship smartphone" },
  {
    id: "phone-samsung-s24-ultra",
    label: "Samsung Galaxy S24 Ultra",
    color: "#8b5cf6",
    description: "Android flagship phone",
  },
  { id: "phone-google-pixel-8", label: "Google Pixel 8", color: "#8b5cf6", description: "Google's flagship phone" },
  { id: "phone-oneplus-12", label: "OnePlus 12", color: "#8b5cf6", description: "High-performance Android phone" },
  { id: "phone-xiaomi-14-pro", label: "Xiaomi 14 Pro", color: "#8b5cf6", description: "Premium smartphone" },
  { id: "tablet-ipad-pro-12.9", label: "iPad Pro 12.9", color: "#10b981", description: "Large professional tablet" },
  { id: "tablet-samsung-tab-s9", label: "Samsung Tab S9", color: "#10b981", description: "Android premium tablet" },
  { id: "tablet-surface-pro-9", label: "Surface Pro 9", color: "#10b981", description: "Microsoft 2-in-1 tablet" },
  { id: "tablet-ipad-air", label: "iPad Air", color: "#10b981", description: "Mid-range Apple tablet" },
  {
    id: "tablet-lenovo-tab-p12",
    label: "Lenovo Tab P12",
    color: "#10b981",
    description: "Android productivity tablet",
  },
  { id: "monitor-lg-27-4k", label: 'LG 27" 4K Monitor', color: "#f59e0b", description: "4K UHD display" },
  {
    id: "monitor-dell-ultrasharp-32",
    label: "Dell UltraSharp 32",
    color: "#f59e0b",
    description: "32-inch professional monitor",
  },
  {
    id: "monitor-samsung-odyssey-g7",
    label: "Samsung Odyssey G7",
    color: "#f59e0b",
    description: "Gaming curved monitor",
  },
  { id: "monitor-benq-pd2700u", label: "BenQ PD2700U", color: "#f59e0b", description: "Designer monitor" },
  {
    id: "monitor-asus-proart-pa278qv",
    label: "ASUS ProArt PA278QV",
    color: "#f59e0b",
    description: "Professional color-accurate display",
  },
  // Continue with more products...
  ...Array.from({ length: 297 }, (_, i) => {
    const categories = [
      { prefix: "laptop", color: "#3b82f6", desc: "Portable computer" },
      { prefix: "phone", color: "#8b5cf6", desc: "Mobile smartphone" },
      { prefix: "tablet", color: "#10b981", desc: "Tablet device" },
      { prefix: "monitor", color: "#f59e0b", desc: "Display screen" },
      { prefix: "keyboard", color: "#ec4899", desc: "Input device" },
      { prefix: "mouse", color: "#06b6d4", desc: "Pointing device" },
      { prefix: "headphone", color: "#8b5cf6", desc: "Audio device" },
      { prefix: "webcam", color: "#f59e0b", desc: "Camera device" },
      { prefix: "router", color: "#10b981", desc: "Network device" },
      { prefix: "printer", color: "#3b82f6", desc: "Printing device" },
    ]
    const cat = categories[i % categories.length]
    const num = Math.floor(i / categories.length) + 21
    return {
      id: `${cat.prefix}-${num}`,
      label: `${cat.prefix.charAt(0).toUpperCase() + cat.prefix.slice(1)} Model ${num}`,
      color: cat.color,
      description: `${cat.desc} - Model ${num}`,
    }
  }),
]

const generateItemData = (itemId: string) => {
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
    const data = generateItemData(item.id)
    const totalQty = data.reduce((sum, d) => sum + d.qty, 0)
    const avgPrice = Math.round(data.reduce((sum, d) => sum + d.price, 0) / data.length)
    const totalSpent = Math.round(data.reduce((sum, d) => sum + d.price * d.qty, 0))
    const lastPurchased = data[data.length - 1].date

    return {
      id: item.id,
      number: index + 1,
      item: item.label,
      description: item.description,
      totalSpent,
      totalQty,
      avgPrice,
      lastPurchased,
    }
  })
}

const tableData = generateTableData()

export default function PriceChartPage() {
  const [selectedItem, setSelectedItem] = useState(items[0].id)
  const [open, setOpen] = useState(false)

  const chartData = generateItemData(selectedItem)
  const currentItem = items.find((item) => item.id === selectedItem)

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-4">
        <Card className="border-border/40 h-[50vh] flex flex-col overflow-hidden">
          <CardHeader className="space-y-3 pb-4 flex-shrink-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">Grimco Item Dashboard</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Track monthly price trends and order quantities
                </CardDescription>
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[280px] justify-between font-normal bg-transparent"
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
                  formatter={(value: number, name: string) => {
                    if (name === "Price") {
                      return [`$${value}`, name]
                    }
                    return [`${value} units`, name]
                  }}
                  labelStyle={{ fontWeight: "500", fontSize: "12px", marginBottom: "4px" }}
                />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />

                <Bar
                  yAxisId="right"
                  dataKey="qty"
                  fill={currentItem?.color}
                  name="Quantity"
                  radius={[3, 3, 0, 0]}
                  opacity={0.5}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke={currentItem?.color}
                  strokeWidth={2.5}
                  name="Price"
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
                    <TableHead className="min-w-[180px] h-9 text-xs font-medium">Item</TableHead>
                    <TableHead className="min-w-[220px] h-9 text-xs font-medium">Description</TableHead>
                    <TableHead className="text-right h-9 text-xs font-medium">Total Spent</TableHead>
                    <TableHead className="text-right h-9 text-xs font-medium">Total Qty</TableHead>
                    <TableHead className="text-right h-9 text-xs font-medium">Avg Price</TableHead>
                    <TableHead className="min-w-[110px] h-9 text-xs font-medium">Last Purchased</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer transition-colors border-border/40",
                        selectedItem === row.id ? "bg-accent/50 hover:bg-accent/60" : "hover:bg-muted/50",
                      )}
                      onClick={() => setSelectedItem(row.id)}
                    >
                      <TableCell className="font-medium text-xs py-2">{row.number}</TableCell>
                      <TableCell className="font-medium text-xs py-2">{row.item}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">{row.description}</TableCell>
                      <TableCell className="text-right font-medium text-xs py-2">
                        ${row.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs py-2">{row.totalQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs py-2">${row.avgPrice.toLocaleString()}</TableCell>
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
