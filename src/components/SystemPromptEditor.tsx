"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FiEdit2 } from 'react-icons/fi';

interface SystemPromptEditorProps {
  systemType: 'PRODUCTS' | 'BLOG' | 'MARKETING';
  triggerButton?: React.ReactNode;
}

export function SystemPromptEditor({ systemType, triggerButton }: SystemPromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPrompt = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/system-prompts?systemType=${systemType}`);
      if (!response.ok) throw new Error('Error al cargar prompt');
      const data = await response.json();
      if (data) {
        setPrompt(data.prompt || '');
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Error al cargar prompt del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrompt();
    }
  }, [isOpen, systemType]);

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast.error('El prompt no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/system-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemType, prompt }),
      });

      if (!response.ok) throw new Error('Error al guardar prompt');

      toast.success('Prompt actualizado exitosamente');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Error al guardar prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const getSystemName = () => {
    switch (systemType) {
      case 'PRODUCTS':
        return 'Investigación de Productos';
      case 'BLOG':
        return 'Blog';
      case 'MARKETING':
        return 'Marketing';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <FiEdit2 className="h-4 w-4 mr-2" />
            Editar Prompt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editar Prompt del Sistema</DialogTitle>
          <DialogDescription>
            Configura el prompt para el sistema de {getSystemName()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt del Sistema</Label>
            <div className="mt-2">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe el prompt del sistema aquí..."
                disabled={isLoading || isSaving}
                className="w-full min-h-[300px] p-3 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {systemType === 'PRODUCTS' && (
                <>
                  Variables disponibles: <code className="bg-muted px-1 py-0.5 rounded">{'{brand}'}</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">{'{model}'}</code>
                </>
              )}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

