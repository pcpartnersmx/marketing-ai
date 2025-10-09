'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ProjectsAPI } from '@/lib/api';
import { PromptProject } from '@/components/Dashboard';
import { toast } from 'sonner';

export function useProjects() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<PromptProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    if (status === 'authenticated') {
      loadProjects();
    }
  }, [status]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectsData = await ProjectsAPI.getProjects();
      
      // Convert string dates to Date objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectsWithDates = projectsData.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      }));
      
      setProjects(projectsWithDates);
    } catch (err) {
      setError('Error al cargar proyectos');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description: string;
    tags?: string[];
    availableVariables?: string[];
    template?: string;
    isPublic?: boolean;
    responseMode?: 'PROMPT' | 'AI_RESPONSE';
  }) => {
    try {
      const newProject = await ProjectsAPI.createProject(projectData);
      
      // Convert string dates to Date objects
      const projectWithDates = {
        ...newProject,
        createdAt: new Date(newProject.createdAt),
        updatedAt: new Date(newProject.updatedAt)
      };
      
      setProjects(prev => [projectWithDates, ...prev]);
      toast.success(`Proyecto "${newProject.name}" creado exitosamente`);
      return projectWithDates;
    } catch (err) {
      toast.error('Error al crear el proyecto');
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (
    id: string, 
    projectData: Partial<Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const updatedProject = await ProjectsAPI.updateProject(id, projectData);
      
      // Convert string dates to Date objects
      const projectWithDates = {
        ...updatedProject,
        createdAt: new Date(updatedProject.createdAt),
        updatedAt: new Date(updatedProject.updatedAt)
      };
      
      setProjects(prev => prev.map(p => p.id === id ? projectWithDates : p));
      toast.success(`Proyecto "${updatedProject.name}" actualizado exitosamente`);
      return projectWithDates;
    } catch (err) {
      toast.error('Error al actualizar el proyecto');
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await ProjectsAPI.deleteProject(id);
      const projectToDelete = projects.find(p => p.id === id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (projectToDelete) {
        toast.success(`Proyecto "${projectToDelete.name}" eliminado exitosamente`);
      }
    } catch (err) {
      toast.error('Error al eliminar el proyecto');
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const generatePrompt = async (id: string, formData: { [key: string]: string }) => {
    try {
      const result = await ProjectsAPI.generatePrompt(id, formData);
      return result.generatedPrompt;
    } catch (err) {
      toast.error('Error al generar el prompt');
      console.error('Error generating prompt:', err);
      throw err;
    }
  };

  const generateAIResponse = async (prompt: string) => {
    try {
      const result = await ProjectsAPI.generateAIResponse(prompt);
      return result.aiResponse;
    } catch (err) {
      toast.error('Error al generar la respuesta de IA');
      console.error('Error generating AI response:', err);
      throw err;
    }
  };

  const generateAIResponseStream = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) => {
    try {
      await ProjectsAPI.generateAIResponseStream(prompt, onChunk, onComplete, onError);
    } catch (err) {
      toast.error('Error al generar la respuesta de IA');
      console.error('Error generating AI response stream:', err);
      onError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    generatePrompt,
    generateAIResponse,
    generateAIResponseStream,
    refreshProjects: loadProjects
  };
}
