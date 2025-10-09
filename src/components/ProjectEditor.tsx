'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiTag, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { PromptProject } from './Dashboard';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from './ui/switch';

type ProjectEditorProps = {
  project?: PromptProject | null;
  onSave: (project: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
};

export default function ProjectEditor({ project, onSave, onCancel, isEditing = false }: ProjectEditorProps) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPromptMode, setIsPromptMode] = useState(project?.responseMode === 'AI_RESPONSE' ? false : true);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setTags(project.tags);
      setIsPromptMode(project.responseMode === 'AI_RESPONSE' ? false : true);
    }
  }, [project]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        tags: tags,
        availableVariables: project?.availableVariables || [
          'producto',
          'publicoObjetivo',
          'objetivo',
          'tono',
          'restricciones'
        ],
        template: project?.template || `Eres un experto en marketing digital especializado en {producto}.

Tu objetivo es crear contenido que resuene con {publicoObjetivo} para lograr {objetivo}.

Tono: {tono}

Restricciones: {restricciones}

Por favor, proporciona una estrategia detallada y creativa.`,
        isPublic: project?.isPublic || false,
        responseMode: (isPromptMode ? 'PROMPT' : 'AI_RESPONSE') as 'PROMPT' | 'AI_RESPONSE'
      };

      onSave(projectData);
      toast.success(isEditing ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente');
    } else {
      toast.error('Por favor, completa todos los campos requeridos');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      toast.success(`Etiqueta "${newTag.trim()}" agregada`);
    } else if (tags.includes(newTag.trim())) {
      toast.error('Esta etiqueta ya existe');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    toast.success(`Etiqueta "${tagToRemove}" eliminada`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target === document.activeElement && (e.target as HTMLInputElement).placeholder?.includes('etiqueta')) {
        addTag();
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
            <FiSave className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black">
              {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isEditing ? 'Modifica la información de tu proyecto' : 'Crea un nuevo proyecto de prompt'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Marketing para E-commerce"
              className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              onKeyPress={handleKeyPress}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito y contexto de este proyecto..."
              rows={3}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>

            {/* Add Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Agregar etiqueta..."
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onKeyPress={handleKeyPress}
              />
              <motion.button
                onClick={addTag}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Tags List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg border border-blue-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <FiTag className="w-3 h-3" />
                    {tag}
                    <motion.button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-blue-200 rounded p-0.5 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </motion.button>
                  </motion.span>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Las etiquetas te ayudan a organizar y encontrar tus proyectos fácilmente
            </p>
            {/* Mode Switch */}
            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Modo de respuesta
              </label>
              <div className="flex gap-2">
                <span className={`text-sm font-medium transition-colors duration-200 ${isPromptMode ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                  Prompt
                </span>
                <Switch
                  checked={!isPromptMode}
                  onCheckedChange={(checked) => setIsPromptMode(!checked)}
                />
                <span className={`text-sm font-medium transition-colors duration-200 ${!isPromptMode ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                  Respuesta IA
                </span>
              </div>
            </div>


          </div>
        </div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="w-full border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              size="lg"
              onClick={handleSave}
              className="w-full bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
