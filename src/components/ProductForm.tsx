"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id?: string;
    brand: string;
    model: string;
    icon?: string;
  };
  icon?: string;
}

export function ProductForm({ onSuccess, onCancel, initialData, icon }: ProductFormProps) {
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim()) {
      toast.error('Marca y modelo son requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData?.id 
        ? `/api/products/${initialData.id}`
        : '/api/products';
      
      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, icon: icon || initialData?.icon || 'Package' }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar producto');
      }

      toast.success(initialData?.id ? 'Producto actualizado' : 'Producto creado');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="brand">Marca</Label>
        <Input
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Ej: Apple, Samsung, Nike..."
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Ej: iPhone 15 Pro, Galaxy S24..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData?.id ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

