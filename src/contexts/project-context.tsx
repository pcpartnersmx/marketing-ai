"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PromptProject } from '@/components/Dashboard';

interface ProjectContextType {
  currentProject: (PromptProject & { generatedPrompt?: string }) | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<(PromptProject & { generatedPrompt?: string }) | null>>;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCreatingProject: boolean;
  setIsCreatingProject: (creating: boolean) => void;
  editingProject: PromptProject | null;
  setEditingProject: (project: PromptProject | null) => void;
  openProject: (project: PromptProject) => void;
  formData: { [key: string]: string };
  setFormData: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  clearFormData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState<(PromptProject & { generatedPrompt?: string }) | null>(null);
  const [currentTab, setCurrentTab] = useState('form');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<PromptProject | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const clearFormData = () => {
    setFormData({});
  };

  const openProject = (project: PromptProject) => {
    setCurrentProject(project);
    setCurrentTab('form');
    setIsCreatingProject(false); // Desactivar el modo de creación
    setEditingProject(null); // Limpiar el modo de edición también
    clearFormData(); // Limpiar el formulario al cambiar de proyecto
    // Asegura que estemos en la página principal donde se renderiza el editor
    router.push('/');
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        currentTab,
        setCurrentTab,
        isCreatingProject,
        setIsCreatingProject,
        editingProject,
        setEditingProject,
        openProject,
        formData,
        setFormData,
        clearFormData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
