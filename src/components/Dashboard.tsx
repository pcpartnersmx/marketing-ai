'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiPlay, FiFolder, FiCalendar, FiTag } from 'react-icons/fi';
import { toast } from 'sonner';

export type PromptProject = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  availableVariables: string[];
  template: string;
  isPublic: boolean;
  responseMode: 'PROMPT' | 'AI_RESPONSE';
  generatedPrompt?: string;
  aiResponse?: string;
};

type DashboardProps = {
  projects: PromptProject[];
  onCreateProject: () => void;
  onEditProject: (project: PromptProject) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenProject: (project: PromptProject) => void;
};

export default function Dashboard({ 
  projects, 
  onCreateProject, 
  onEditProject, 
  onDeleteProject, 
  onOpenProject 
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags from projects
  const allTags = Array.from(new Set(projects.flatMap(project => project.tags)));

  // Filter projects based on search term and selected tag
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || project.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleOpenProject = (project: PromptProject) => {
    onOpenProject(project);
    toast.success(`Abriendo "${project.name}"`);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${projectName}"?`)) {
      onDeleteProject(projectId);
      toast.success(`Proyecto "${projectName}" eliminado`);
    }
  };

  const handleEditProject = (project: PromptProject) => {
    onEditProject(project);
    toast.info(`Editando "${project.name}"`);
  };

  const handleCreateProject = () => {
    onCreateProject();
    toast.success("Creando nuevo proyecto");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
            <FiFolder className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black">Mis Proyectos</h2>
            <p className="text-gray-600 text-sm">Gestiona tus prompts personalizados</p>
          </div>
        </div>
        <motion.button
          onClick={handleCreateProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </motion.button>
      </div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFolder className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-blue-700"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {projects.length}
              </motion.p>
              <p className="text-sm text-blue-600">Total Proyectos</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPlay className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-green-700"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {projects.length}
              </motion.p>
              <p className="text-sm text-green-600">Templates Activos</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="bg-purple-50 border border-purple-200 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiTag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-purple-700"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {allTags.length}
              </motion.p>
              <p className="text-sm text-purple-600">Tags Únicos</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Todas las etiquetas</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FiFolder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm || selectedTag ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedTag 
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'Crea tu primer proyecto para empezar a generar prompts personalizados'
            }
          </p>
          {!searchTerm && !selectedTag && (
            <button
              onClick={onCreateProject}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiPlus className="w-4 h-4" />
              <span>Crear Primer Proyecto</span>
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer"
                onClick={() => handleOpenProject(project)}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-1 group-hover:text-blue-600 transition-colors duration-200">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                    className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors duration-200"
                    title="Editar proyecto"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiEdit3 className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.name);
                    }}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                    title="Eliminar proyecto"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Project Stats */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{project.availableVariables.length}</p>
                  <p className="text-xs text-gray-500">Variables Disponibles</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>Actualizado {formatDate(project.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Template</span>
                </div>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
