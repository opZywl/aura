"use client"

import { RadialBar, RadialBarChart, Cell } from "recharts"
import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface GlowingRadialChartProps {
    data: Array<{
        name: string
        value: number
        fill: string
    }>
    title: string
    description: string
    trend?: string
    config: ChartConfig
}

type ActiveItem = string | "all" | null

export function GlowingRadialChart({ data, title, description, trend, config }: GlowingRadialChartProps) {
    const [activeItem, setActiveItem] = React.useState<ActiveItem>(null)

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>
                    {title}
                    {trend && (
                        <Badge variant="outline" className="text-green-500 bg-green-500/10 border-none ml-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>{trend}</span>
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <RadialBarChart
                        data={data}
                        innerRadius={30}
                        outerRadius={110}
                        onMouseMove={(chartData) => {
                            if (chartData && chartData.activePayload && chartData.activePayload[0]) {
                                setActiveItem(chartData.activePayload[0].payload.name)
                            }
                        }}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <RadialBar cornerRadius={10} dataKey="value" background className="drop-shadow-lg">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                    filter={activeItem === entry.name ? `url(#radial-glow-${entry.name})` : undefined}
                                    opacity={activeItem === null || activeItem === entry.name ? 1 : 0.3}
                                />
                            ))}
                        </RadialBar>
                        <defs>
                            {data.map((entry) => (
                                <filter
                                    key={`filter-${entry.name}`}
                                    id={`radial-glow-${entry.name}`}
                                    x="-50%"
                                    y="-50%"
                                    width="200%"
                                    height="200%"
                                >
                                    <feGaussianBlur stdDeviation="8" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            ))}
                        </defs>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
