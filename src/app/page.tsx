'use client';

import { useState, useEffect } from 'react';
import { PromptProject } from "@/components/Dashboard"
import ProjectEditor from "@/components/ProjectEditor"
import FormComponent from "@/components/FormComponent"
import TemplateEditor from "@/components/TemplateEditor"
import PromptDisplay from "@/components/PromptDisplay"
import { useProjectsContext } from "@/contexts/projects-context"
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFolder, FiZap, FiSettings, FiEdit3, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/project-context';

export default function Page() {
  const { data: session, status } = useSession();
  const { 
    currentProject, 
    setCurrentProject, 
    currentTab, 
    setCurrentTab, 
    isCreatingProject, 
    setIsCreatingProject, 
    editingProject, 
    setEditingProject,
    clearFormData
  } = useProject();

  // Estado para manejar el streaming de IA
  const [isStreamingAI, setIsStreamingAI] = useState(false);

  // Use projects context
  const {
    projects,
    isLoading,
    error,
    createProject: apiCreateProject,
    updateProject: apiUpdateProject,
    generatePrompt: apiGeneratePrompt,
    generateAIResponse: apiGenerateAIResponse,
    generateAIResponseStream
  } = useProjectsContext();

  // Sync currentProject with projects array when it updates
  useEffect(() => {
    if (currentProject && projects.length > 0) {
      const updatedProject = projects.find(p => p.id === currentProject.id);
      if (updatedProject && updatedProject.template !== currentProject.template) {
        console.log('Sincronizando currentProject con projects array:', updatedProject);
        setCurrentProject(updatedProject);
      }
    }
  }, [projects, currentProject]);

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

  // Redirigir usuarios VIEWER del tab template al tab form
  useEffect(() => {
    if (session?.user?.role === 'VIEWER' && currentTab === 'template') {
      setCurrentTab('form');
    }
  }, [session?.user?.role, currentTab]);

  // Redirigir del tab result al tab form si no hay template
  useEffect(() => {
    if (currentTab === 'result' && !currentProject?.template?.trim()) {
      setCurrentTab('form');
    }
  }, [currentTab, currentProject?.template]);

  const handleGeneratePrompt = async (formData: { [key: string]: string }) => {
    console.log('handleGeneratePrompt llamado con formData:', formData);
    console.log('currentProject:', currentProject);
    
    if (currentProject && currentProject.template) {
      try {
        console.log('Template actual:', currentProject.template);
        
        // Generate the prompt using the form data
        console.log('Generando prompt con formData:', formData);
        const generatedPrompt = await apiGeneratePrompt(currentProject.id, formData);
        console.log('Prompt generado:', generatedPrompt);
        
        // Store the generated prompt in state for display
        setCurrentProject(prev => prev ? { ...prev, generatedPrompt } : null);
        
        // If responseMode is AI_RESPONSE, generate AI response automatically with streaming
        if (currentProject.responseMode === 'AI_RESPONSE') {
          console.log('Iniciando generación de respuesta de IA con streaming...');
          setIsStreamingAI(true);
          // Generate AI response with streaming
          let streamingResponse = '';
          generateAIResponseStream(
            generatedPrompt,
            (chunk: string) => {
              streamingResponse += chunk;
              setCurrentProject(prev => prev ? { ...prev, aiResponse: streamingResponse } : null);
            },
            () => {
              console.log('Streaming completado');
              setIsStreamingAI(false);
              setCurrentProject(prev => prev ? { ...prev, aiResponse: streamingResponse } : null);
            },
            (error: string) => {
              console.error('Error en streaming:', error);
              setIsStreamingAI(false);
              setCurrentProject(prev => prev ? { ...prev, aiResponse: 'Error al generar respuesta: ' + error } : null);
            }
          );
        }
        
        // Navigate to result tab
        setCurrentTab('result');
      } catch (error) {
        console.error('Error en handleGeneratePrompt:', error);
        // Error is already handled in the hook
      }
    }
  };

  const handleTemplateSubmit = async (template: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, { template });
        setCurrentProject(updatedProject);
        setCurrentTab('result');
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };


  const handleResetForm = async () => {
    if (currentProject) {
      try {
        setCurrentProject(prev => prev ? { ...prev, generatedPrompt: '' } : null);
        clearFormData();
        setCurrentTab('form');
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleAddVariable = async (variableName: string) => {
    if (currentProject && !currentProject.availableVariables.includes(variableName)) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: [...currentProject.availableVariables, variableName]
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteVariable = async (variableName: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: currentProject.availableVariables.filter(v => v !== variableName)
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleUpdateVariable = async (oldName: string, newName: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: currentProject.availableVariables.map(v => v === oldName ? newName : v)
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sidebar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
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
    );
  }

  if (isCreatingProject) {
    return (
      <div className="px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProjectEditor
            onSave={createProject}
            onCancel={() => setIsCreatingProject(false)}
          />
        </motion.div>
      </div>
    );
  }

  if (editingProject) {
    return (
      <div className="px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProjectEditor
            project={editingProject}
            onSave={updateProject}
            onCancel={() => setEditingProject(null)}
            isEditing={true}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {currentProject ? (
        // Project View with Modern Design
        <div className="px-4 lg:px-6 h-full flex flex-col">
          {/* Modern Project Header */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sidebar-accent rounded-lg">
                  <FiFolder className="w-5 h-5 text-sidebar-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sidebar-foreground">{currentProject.name}</h1>
                  <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentProject(null);
                  setCurrentTab('form');
                }}
                className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
            
            {/* Modern Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-sidebar-accent/50 rounded-lg border border-sidebar-border">
              <button
                onClick={() => setCurrentTab('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentTab === 'form'
                    ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <FiSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Fomulario</span>
                <span className="sm:hidden">Form</span>
              </button>
              {/* Solo mostrar Editor para usuarios ADMIN y EDITOR */}
              {session?.user?.role !== 'VIEWER' && (
                <button
                  onClick={() => setCurrentTab('template')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentTab === 'template'
                      ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editor</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCurrentTab('result')}
                    disabled={!currentProject?.template?.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentTab === 'result'
                        ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <FiFileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Resultado</span>
                    <span className="sm:hidden">Result</span>
                  </button>
                </TooltipTrigger>
                {!currentProject?.template?.trim() && (
                  <TooltipContent>
                    <p>
                      {session?.user?.role === 'ADMIN' 
                        ? 'No hay un template configurado para este proyecto. Ve a la pestaña "Editor" para crear uno.'
                        : 'Este proyecto no tiene un template configurado. Contacta al administrador para configurarlo.'
                      }
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </motion.div>

          {/* Tab Contents with Modern Design */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {currentTab === 'form' && (
                  <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                    <div className="p-6 h-full">
                      <FormComponent 
                        availableVariables={currentProject.availableVariables}
                        template={currentProject.template}
                        userRole={session?.user?.role}
                        responseMode={currentProject.responseMode}
                        onGeneratePrompt={handleGeneratePrompt}
                      />
                    </div>
                  </div>
                )}

                {currentTab === 'template' && session?.user?.role !== 'VIEWER' && (
                  <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                    <div className="p-6 h-full">
      <TemplateEditor
        template={currentProject.template}
        onSubmit={handleTemplateSubmit}
        onBack={() => setCurrentTab('form')}
        availableVariables={currentProject.availableVariables}
        onAddVariable={handleAddVariable}
        onDeleteVariable={handleDeleteVariable}
        onUpdateVariable={handleUpdateVariable}
        onTemplateChange={async (template) => {
          try {
            await apiUpdateProject(currentProject.id, { template });
          } catch (error) {
            // Error is already handled in the hook
          }
        }}
        onGeneratePrompt={async () => {
          if (currentProject && currentProject.template) {
            try {
              // Generate prompt with empty form data for template preview
              const generatedPrompt = await apiGeneratePrompt(currentProject.id, {});
              setCurrentProject(prev => prev ? { ...prev, generatedPrompt } : null);
              setCurrentTab('result');
            } catch (error) {
              // Error is already handled in the hook
            }
          }
        }}
      />
                    </div>
                  </div>
                )}

                {currentTab === 'result' && (
                  <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                    <div className="p-6 h-full">
                      <PromptDisplay
                        prompt={currentProject.generatedPrompt || ''}
                        aiResponse={currentProject.aiResponse}
                        responseMode={currentProject.responseMode}
                        isStreamingAI={isStreamingAI}
                        onGenerate={() => {
                          // Generate with empty form data for template preview
                          handleGeneratePrompt({});
                        }}
                        onBack={() => setCurrentTab('form')}
                        onReset={handleResetForm}
                        onSwitchToResult={() => setCurrentTab('result')}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Dashboard View
        <>
          {/* Modern Welcome Header */}
          <motion.div 
            className="px-4 lg:px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-sidebar-accent rounded-xl">
                <FiZap className="w-6 h-6 text-sidebar-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sidebar-foreground">
                  Bienvenido de vuelta
                </h1>
                <p className="text-muted-foreground">
                  {session?.user ? `Hola, ${session.user.email}` : 'Cargando...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Modern Main Content */}
          <div className="flex-1 flex items-center justify-center px-4 lg:px-6">
            <motion.div 
              className="text-center max-w-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-sidebar-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-sidebar-border">
                  <FiFolder className="w-12 h-12 text-sidebar-accent-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-sidebar-foreground mb-3">
                  {projects.length === 0 ? 'No tienes proyectos aún' : 'Selecciona un proyecto'}
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  {projects.length === 0 
                    ? 'Crea tu primer proyecto para empezar a generar prompts personalizados'
                    : 'Haz clic en un proyecto del sidebar para comenzar a editarlo'
                  }
                </p>
              </div>

              {projects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Button
                    onClick={() => setIsCreatingProject(true)}
                    size="lg"
                    className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Crear Primer Proyecto
                  </Button>
                </motion.div>
              )}

              {projects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="bg-sidebar-accent/30 border border-sidebar-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      💡 Consejo: Usa <kbd className="px-2 py-1 bg-sidebar-accent rounded text-xs">Ctrl+Space</kbd> para buscar proyectos rápidamente
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsCreatingProject(true)}
                    variant="outline"
                    size="lg"
                    className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium transition-all duration-200"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Nuevo Proyecto
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </>
  )
}
