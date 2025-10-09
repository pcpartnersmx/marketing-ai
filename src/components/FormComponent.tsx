'use client';

import { useState, useEffect } from 'react';
import { FiArrowRight, FiCheck, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/project-context';

type FormData = {
  [key: string]: string;
};

type FormComponentProps = {
  availableVariables: string[];
  template?: string;
  userRole?: string;
  responseMode?: 'PROMPT' | 'AI_RESPONSE';
  onGeneratePrompt: (formData: FormData) => void;
};

export default function FormComponent({ availableVariables, template, userRole, responseMode, onGeneratePrompt }: FormComponentProps) {
  const { formData, setFormData } = useProject();
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Validate required fields (first 4 are required by default)
    const requiredFields = availableVariables.slice(0, 4);
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        const fieldLabels: { [key: string]: string } = {
          'producto': 'El producto es requerido',
          'publicoObjetivo': 'El público objetivo es requerido',
          'objetivo': 'El objetivo es requerido',
          'tono': 'El tono es requerido'
        };
        newErrors[field] = fieldLabels[field] || `El campo ${field} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePrompt = () => {
    console.log('FormComponent - formData actual:', formData);
    console.log('FormComponent - validateForm result:', validateForm());
    
    if (validateForm() && hasValidTemplate()) {
      console.log('FormComponent - llamando onGeneratePrompt con:', formData);
      onGeneratePrompt(formData);
    }
  };

  const hasValidTemplate = (): boolean => {
    return !!(template && template.trim().length > 0);
  };

  const getFieldConfig = (variable: string) => {
    const fieldLabels: { [key: string]: string } = {
      'producto': 'Producto/Servicio',
      'publicoObjetivo': 'Público Objetivo',
      'objetivo': 'Objetivo',
      'tono': 'Tono',
      'restricciones': 'Restricciones'
    };

    const fieldPlaceholders: { [key: string]: string } = {
      'producto': 'Ej: Aplicación móvil de fitness',
      'publicoObjetivo': 'Ej: Personas de 25-40 años interesadas en salud',
      'objetivo': 'Ej: Aumentar las descargas en un 50%',
      'tono': 'Ej: Profesional, motivacional, casual',
      'restricciones': 'Ej: Máximo 500 palabras, evitar jerga técnica'
    };

    return {
      key: variable,
      label: fieldLabels[variable] || variable.charAt(0).toUpperCase() + variable.slice(1),
      placeholder: fieldPlaceholders[variable] || `Ingresa ${variable}`,
      required: availableVariables.indexOf(variable) < 4 // First 4 are required
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
          <FiCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-black">Formulario</h2>
          <p className="text-gray-600 text-sm">Completa los campos para generar el prompt</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {availableVariables.map((variable) => {
          const field = getFieldConfig(variable);
          return (
            <div key={field.key} className="group">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {field.required && <FiAlertCircle className="w-4 h-4 text-red-500" />}
                {field.label}
                {field.required && <span className="text-red-500 text-xs">(requerido)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors[field.key] 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400 group-focus-within:border-blue-500'
                  }`}
                />
                {formData[field.key] && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiCheck className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors[field.key] && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors[field.key]}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Tipo de respuesta:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                responseMode === 'AI_RESPONSE' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {responseMode === 'AI_RESPONSE' ? 'Respuesta IA' : 'Prompt'}
              </span>
            </div>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleGeneratePrompt}
                  disabled={!hasValidTemplate()}
                  className="w-full bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sidebar-accent disabled:hover:shadow-lg"
                >
                  <span>Generar {responseMode === 'AI_RESPONSE' ? 'Respuesta IA' : 'Prompt'}</span>
                  <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </TooltipTrigger>
            {!hasValidTemplate() && (
              <TooltipContent>
                <p>
                  {userRole === 'ADMIN' 
                    ? 'No hay un template configurado para este proyecto. Ve a la pestaña "Editor" para crear uno.'
                    : 'Este proyecto no tiene un template configurado. Contacta al administrador para configurarlo.'
                  }
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
