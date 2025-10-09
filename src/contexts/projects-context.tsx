"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { PromptProject } from '@/components/Dashboard';

interface ProjectsContextType {
  projects: PromptProject[];
  isLoading: boolean;
  error: string | null;
  createProject: (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptProject>;
  updateProject: (id: string, projectData: Partial<Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<PromptProject>;
  deleteProject: (id: string) => Promise<void>;
  generatePrompt: (id: string, formData: { [key: string]: string }) => Promise<string>;
  generateAIResponse: (prompt: string) => Promise<string>;
  generateAIResponseStream: (prompt: string, onChunk: (chunk: string) => void, onComplete: () => void, onError: (error: string) => void) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const projectsData = useProjects();

  return (
    <ProjectsContext.Provider value={projectsData}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
}
