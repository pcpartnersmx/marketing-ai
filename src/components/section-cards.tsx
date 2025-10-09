import { IconTrendingDown, IconTrendingUp, IconFolder, IconBolt, IconTag, IconPlus } from "@tabler/icons-react"
import { PromptProject } from "@/components/Dashboard"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardsProps = {
  projects: PromptProject[];
  onCreateProject: () => void;
};

export function SectionCards({ projects, onCreateProject }: SectionCardsProps) {
  // Calculate statistics
  const totalProjects = projects.length;
  const generatedPrompts = projects.filter(p => p.template && p.template.length > 0).length;
  const allTags = Array.from(new Set(projects.flatMap(project => project.tags)));
  const totalVariables = projects.reduce((sum, project) => sum + project.availableVariables.length, 0);
  
  // Calculate completion rate (projects with templates)
  const completedProjects = projects.filter(project => 
    project.template && project.template.trim() !== ''
  ).length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Proyectos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFolder className="size-4" />
              {totalProjects > 0 ? 'Activos' : 'Vacío'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Proyectos de prompts <IconFolder className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {totalProjects > 0 ? 'Gestiona tus proyectos' : 'Crea tu primer proyecto'}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Prompts Generados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {generatedPrompts}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBolt className="size-4" />
              {totalProjects > 0 ? `${Math.round((generatedPrompts / totalProjects) * 100)}%` : '0%'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {generatedPrompts > 0 ? 'Prompts completados' : 'Sin prompts generados'} <IconBolt className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {generatedPrompts > 0 ? 'Trabajo en progreso' : 'Comienza a generar'}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Variables Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalVariables}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTag className="size-4" />
              {totalProjects > 0 ? `${Math.round(totalVariables / totalProjects)} avg` : '0 avg'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Variables personalizables <IconTag className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {totalVariables > 0 ? 'Flexibilidad en prompts' : 'Sin variables definidas'}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nuevo Proyecto</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Button 
              onClick={onCreateProject}
              className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <IconPlus className="size-4 mr-2" />
              Crear
            </Button>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" />
              +1
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Comienza un nuevo proyecto <IconPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Crea prompts personalizados
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
