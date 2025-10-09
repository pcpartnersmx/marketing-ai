
import { useState, useEffect } from 'react';
import { FiEdit3, FiPlus, FiTrash2, FiSave, FiX, FiCode, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';

type TemplateEditorProps = {
  template: string;
  onSubmit: (template: string) => void;
  onBack: () => void;
  availableVariables: string[];
  onAddVariable: (variableName: string) => void;
  onDeleteVariable: (variableName: string) => void;
  onUpdateVariable: (oldName: string, newName: string) => void;
  onTemplateChange?: (template: string) => void;
  onGeneratePrompt?: () => void;
};

export default function TemplateEditor({
  template,
  onSubmit,
  onBack,
  availableVariables: propAvailableVariables,
  onAddVariable,
  onDeleteVariable,
  onUpdateVariable,
  onTemplateChange,
  onGeneratePrompt
}: TemplateEditorProps) {
  const [templateText, setTemplateText] = useState(template);
  const [newVariable, setNewVariable] = useState('');
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTemplate, setLastSavedTemplate] = useState(template);

  // Debounce the template text for auto-save
  const debouncedTemplate = useDebounce(templateText, 1000); // 1 second delay

  useEffect(() => {
    setTemplateText(template);
    setLastSavedTemplate(template);
  }, [template]);

  // Auto-save when debounced template changes and it's different from last saved
  useEffect(() => {
    if (debouncedTemplate !== lastSavedTemplate && onTemplateChange && debouncedTemplate !== '') {
      setIsSaving(true);
      onTemplateChange(debouncedTemplate);
      setLastSavedTemplate(debouncedTemplate);

      // Reset saving state after a short delay
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  }, [debouncedTemplate, lastSavedTemplate, onTemplateChange]);

  const handleVariableClick = (variable: string) => {
    const textarea = document.getElementById('template-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const variablePattern = `{${variable}}`;
      const newText = templateText.substring(0, start) + variablePattern + templateText.substring(end);
      setTemplateText(newText);

      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variablePattern.length, start + variablePattern.length);
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(templateText);
  };

  const addVariable = () => {
    if (newVariable.trim() && !propAvailableVariables.includes(newVariable.trim())) {
      onAddVariable(newVariable.trim());
      setNewVariable('');
    }
  };

  const deleteVariable = (variable: string) => {
    onDeleteVariable(variable);
    // Remove all instances of the variable from template
    const variablePattern = `{${variable}}`;
    setTemplateText(templateText.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), ''));
  };

  const startEditing = (variable: string) => {
    setEditingVariable(variable);
    setEditValue(variable);
  };

  const saveEdit = () => {
    if (editValue.trim() && editingVariable) {
      onUpdateVariable(editingVariable, editValue.trim());
      setEditingVariable(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingVariable(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6 h-[80%]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <FiEdit3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Editor de Template</h2>
            <p className="text-muted-foreground text-sm">Personaliza tu template con variables dinámicas</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Volver</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full ">
        {/* Main Editor Section */}
        <div className="lg:col-span-2  h-full">
          <form onSubmit={handleSubmit} className="space-y-6 h-full">
            <div className="space-y-3 h-full">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FiEdit3 className="w-4 h-4 text-primary" />
                Template del Prompt
              </label>
              <div className="relative h-full">
                <textarea
                  id="template-textarea"
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  placeholder="Escribe tu template aquí usando las variables disponibles..."
                  className="w-full h-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-all duration-200 font-mono text-sm leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
                  <span>{templateText.length} caracteres</span>
                  {isSaving && (
                    <div className="flex items-center gap-1 text-primary">
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  )}
                  {!isSaving && debouncedTemplate === lastSavedTemplate && templateText !== '' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <FiCheck className="w-3 h-3" />
                      <span>Guardado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Variables Panel */}
        <div className="space-y-4 h-full flex flex-col justify-between">

          <div className='space-y-4'>
            <div className="flex items-center gap-2 mb-4">
              <FiCode className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-foreground">Variables Disponibles</h3>
            </div>

            {/* Add new variable section */}
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <FiPlus className="w-4 h-4 text-green-600" />
                Agregar Nueva Variable
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="nombre_variable"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                />
                <Button
                  onClick={addVariable}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar</span>
                </Button>
              </div>
            </div>

            {/* Variables list */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {propAvailableVariables.map((variable) => (
                  <div key={variable} className="flex items-center gap-1">
                    {editingVariable === variable ? (
                      <div className="flex items-center gap-1 bg-muted p-2 rounded-md border border-border">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-2 py-1 bg-background border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          autoFocus
                        />
                        <Button
                          onClick={saveEdit}
                          size="icon"
                          className="h-6 w-6 bg-green-600 hover:bg-green-700 text-white"
                          title="Guardar"
                        >
                          <FiSave className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          title="Cancelar"
                        >
                          <FiX className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleVariableClick(variable)}
                          variant="outline"
                          size="sm"
                          className="group bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 text-primary hover:text-primary font-mono"
                        >
                          <FiCode className="w-3 h-3" />
                          {`{${variable}}`}
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEditing(variable)}
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 hover:border-yellow-300 text-yellow-700 hover:text-yellow-800"
                            title="Editar"
                          >
                            <FiEdit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteVariable(variable)}
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800"
                            title="Eliminar"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                <FiCode className="w-3 h-3" />
                <span>Haz clic en una variable para insertarla en el template</span>
              </div>
            </div>
          </div>



          <div className="mt-6">
            <Button
              type="button"
              size="lg"
              onClick={onGeneratePrompt}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span className="flex items-center justify-center gap-2">
                <FiCode className="w-4 h-4" />
                Generar Prompt
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
