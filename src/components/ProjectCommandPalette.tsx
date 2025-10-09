'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { FiPlus, FiFolder, FiSearch, FiEdit3, FiTrash2, FiCalendar, FiTag } from 'react-icons/fi';
import { PromptProject } from '@/components/Dashboard';
import { toast } from 'sonner';

interface ProjectCommandPaletteProps {
  projects: PromptProject[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProject: (project: PromptProject) => void;
  onEditProject: (project: PromptProject) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: () => void;
  user?: { role: string } | null;
}

export function ProjectCommandPalette({
  projects,
  isOpen,
  onOpenChange,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
  user,
}: ProjectCommandPaletteProps) {
  const { data: session } = useSession();
  const [searchValue, setSearchValue] = useState('');

  // Filter projects based on search
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const handleProjectSelect = (project: PromptProject) => {
    onOpenProject(project);
    onOpenChange(false);
    setSearchValue('');
  };

  const handleEditProject = (project: PromptProject, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditProject(project);
    onOpenChange(false);
    setSearchValue('');
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteProject(projectId);
    toast.success('Proyecto eliminado exitosamente');
  };

  const handleCreateProject = () => {
    onCreateProject();
    onOpenChange(false);
    setSearchValue('');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    try {
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
      title="Buscador de Proyectos"
      description="Busca y gestiona tus proyectos de prompts"
      className="max-w-2xl"
    >
      <CommandInput
        placeholder="Buscar proyectos por nombre, descripción o etiquetas..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FiSearch className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {searchValue ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
            </p>
            {!searchValue && user?.role === 'ADMIN' && (
              <Button
                onClick={handleCreateProject}
                size="sm"
                className="mt-2"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Crear primer proyecto
              </Button>
            )}
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        {user?.role === 'ADMIN' && (
          <CommandGroup heading="Acciones Rápidas">
            <CommandItem onSelect={handleCreateProject}>
              <FiPlus className="w-4 h-4 mr-2" />
              <span>Crear nuevo proyecto</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Projects List */}
        {filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Proyectos (${filteredProjects.length})`}>
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => handleProjectSelect(project)}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FiFolder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm truncate">
                          {project.name}
                        </p>
                        {project.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {project.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              >
                                <FiTag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{project.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {formatDate(project.updatedAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {project.availableVariables.length} variables
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditProject(project, e)}
                        className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <FiEdit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* User Info */}
        {session?.user && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Usuario">
              <CommandItem className="text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {session.user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">
                    {session.user.email}
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
