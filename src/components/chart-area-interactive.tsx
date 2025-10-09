"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { PromptProject } from "@/components/Dashboard"

type ChartAreaInteractiveProps = {
  projects: PromptProject[];
};

export const description = "An interactive area chart showing project activity"

const chartConfig = {
  projects: {
    label: "Proyectos",
    color: "hsl(var(--primary))",
  },
  generated: {
    label: "Prompts Generados",
    color: "hsl(var(--chart-2))",
  },
  variables: {
    label: "Variables Totales",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ projects }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Generate chart data based on projects
  const generateChartData = () => {
    const now = new Date()
    const data = []
    
    // Calculate days to go back based on time range
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    for (let i = daysToSubtract; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Count projects created on this date
      const projectsOnDate = projects.filter(project => {
        const projectDate = new Date(project.createdAt)
        return projectDate.toDateString() === date.toDateString()
      }).length

      // Count generated prompts on this date (projects with templates)
      const generatedOnDate = projects.filter(project => {
        const projectDate = new Date(project.updatedAt)
        return projectDate.toDateString() === date.toDateString() && project.template && project.template.length > 0
      }).length

      // Count total variables on this date
      const variablesOnDate = projects
        .filter(project => {
          const projectDate = new Date(project.createdAt)
          return projectDate <= date
        })
        .reduce((sum, project) => sum + project.availableVariables.length, 0)

      data.push({
        date: date.toISOString().split('T')[0],
        projects: projectsOnDate,
        generated: generatedOnDate,
        variables: variablesOnDate,
      })
    }

    return data
  }

  const chartData = generateChartData()

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Actividad de Proyectos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Progreso de proyectos y prompts generados
          </span>
          <span className="@[540px]/card:hidden">Progreso de proyectos</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar rango de tiempo"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-projects)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-projects)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-generated)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-generated)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillVariables" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-variables)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-variables)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="projects"
              type="natural"
              fill="url(#fillProjects)"
              stroke="var(--color-projects)"
              stackId="a"
            />
            <Area
              dataKey="generated"
              type="natural"
              fill="url(#fillGenerated)"
              stroke="var(--color-generated)"
              stackId="a"
            />
            <Area
              dataKey="variables"
              type="natural"
              fill="url(#fillVariables)"
              stroke="var(--color-variables)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
