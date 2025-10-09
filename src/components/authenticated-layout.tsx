"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { PromptProject } from "@/components/Dashboard";
import { ProjectCommandPalette } from "@/components/ProjectCommandPalette";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useProjectsContext } from "@/contexts/projects-context";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FiTrash2 } from 'react-icons/fi';
import { ProjectProvider, useProject } from '@/contexts/project-context';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayoutContent({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const { openProject, isCreatingProject, setIsCreatingProject, editingProject, setEditingProject } = useProject();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Command Palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { isOpen: commandPaletteIsOpen, onOpenChange: onCommandPaletteOpenChange } = useCommandPalette(
    isCommandPaletteOpen,
    setIsCommandPaletteOpen
  );

  // Use projects context
  const {
    projects,
    isLoading,
    error,
    createProject: apiCreateProject,
    updateProject: apiUpdateProject,
    deleteProject: apiDeleteProject,
  } = useProjectsContext();

  // Project management functions
  const createProject = async (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await apiCreateProject({
        name: projectData.name,
        description: projectData.description,
        tags: projectData.tags,
        availableVariables: projectData.availableVariables,
        template: projectData.template,
        isPublic: projectData.isPublic,
        responseMode: projectData.responseMode
      });
      setIsCreatingProject(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const updateProject = async (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    try {
      await apiUpdateProject(editingProject.id, projectData);
      setEditingProject(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const toggleProjectPublic = async (projectId: string, isPublic: boolean) => {
    try {
      await apiUpdateProject(projectId, { isPublic });
      toast.success(`Proyecto ${isPublic ? 'hecho público' : 'hecho privado'} exitosamente`);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(projectId);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await apiDeleteProject(projectToDelete);
        setShowDeleteDialog(false);
        setProjectToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const cancelDeleteProject = () => {
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={[]} 
          onOpenProject={() => {}}
          user={session?.user}
          onCreateProject={() => {}}
          onOpenCommandPalette={() => {}}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-sidebar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={[]} 
          onOpenProject={() => {}}
          user={session?.user}
          onCreateProject={() => {}}
          onOpenCommandPalette={() => {}}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-lg hover:bg-sidebar-accent/90"
              >
                Reintentar
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        projects={projects} 
        onOpenProject={openProject}
        onEditProject={setEditingProject}
        onDeleteProject={deleteProject}
        onTogglePublic={toggleProjectPublic}
        user={session?.user}
        onCreateProject={() => setIsCreatingProject(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 h-full">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiTrash2 className="w-5 h-5 text-red-600" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={cancelDeleteProject}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProject}
              className="w-full sm:w-auto"
            >
              <FiTrash2 className="w-4 h-4 mr-2" />
              Eliminar proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <ProjectCommandPalette
        projects={projects}
        isOpen={commandPaletteIsOpen}
        onOpenChange={onCommandPaletteOpenChange}
        onOpenProject={openProject}
        onEditProject={setEditingProject}
        onDeleteProject={deleteProject}
        onCreateProject={() => setIsCreatingProject(true)}
        user={session?.user}
      />
    </SidebarProvider>
  );
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <ProjectProvider>
      <AuthenticatedLayoutContent>
        {children}
      </AuthenticatedLayoutContent>
    </ProjectProvider>
  );
}
