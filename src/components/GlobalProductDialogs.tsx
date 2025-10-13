"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { toast } from 'sonner';
import { Product } from '@prisma/client';
import { 
  FiPackage, FiBox, FiShoppingCart, FiShoppingBag, FiTag, FiTruck,
  FiStar, FiHeart, FiGift, FiCpu, FiMonitor, FiSmartphone,
  FiWatch, FiHeadphones, FiCamera, FiAperture, FiZap, FiTrendingUp,
  FiEdit2
} from 'react-icons/fi';

interface GlobalProductDialogsProps {
  isFormOpen: boolean;
  onFormClose: () => void;
  editingProduct?: Product | null;
  onFormSuccess?: () => void;
  userRole?: string;
}

const availableIcons = [
  { Icon: FiPackage, name: 'Package' },
  { Icon: FiBox, name: 'Box' },
  { Icon: FiShoppingCart, name: 'Shopping Cart' },
  { Icon: FiShoppingBag, name: 'Shopping Bag' },
  { Icon: FiTag, name: 'Tag' },
  { Icon: FiTruck, name: 'Truck' },
  { Icon: FiStar, name: 'Star' },
  { Icon: FiHeart, name: 'Heart' },
  { Icon: FiGift, name: 'Gift' },
  { Icon: FiCpu, name: 'CPU' },
  { Icon: FiMonitor, name: 'Monitor' },
  { Icon: FiSmartphone, name: 'Smartphone' },
  { Icon: FiWatch, name: 'Watch' },
  { Icon: FiHeadphones, name: 'Headphones' },
  { Icon: FiCamera, name: 'Camera' },
  { Icon: FiAperture, name: 'Aperture' },
  { Icon: FiZap, name: 'Zap' },
  { Icon: FiTrendingUp, name: 'Trending Up' },
];

export function GlobalProductDialogs({
  isFormOpen,
  onFormClose,
  editingProduct = null,
  onFormSuccess,
  userRole
}: GlobalProductDialogsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(0);

  useEffect(() => {
    if (editingProduct?.icon) {
      const iconIndex = availableIcons.findIndex(i => i.name === editingProduct.icon);
      if (iconIndex !== -1) {
        setSelectedIcon(iconIndex);
      }
    } else if (!editingProduct) {
      setSelectedIcon(0);
    }
  }, [editingProduct]);

  const handleFormSuccess = async () => {
    setIsLoading(true);
    try {
      // Llamar al callback si existe
      onFormSuccess?.();
      onFormClose();
      toast.success(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
    } catch (error) {
      console.error('Error in form success handler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    onFormClose();
  };

  return (
    <>
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={onFormClose}>
        <DialogContent>
          <DialogHeader>
            <div className='flex gap-2 items-center'>
              <button 
                onClick={() => setIsIconSelectorOpen(true)}
                className="relative p-2 border border-gray-300 rounded hover:bg-gray-400 hover:text-white hover:border-gray-400 transition-colors group"
              >
                <span className="group-hover:opacity-0 transition-opacity">
                  {React.createElement(availableIcons[selectedIcon].Icon, { size: 20 })}
                </span>
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEdit2 size={20} />
                </span>
              </button>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {editingProduct
                ? 'Actualiza la marca y modelo del producto'
                : 'Agrega un nuevo producto para investigar'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={editingProduct ? {
              id: editingProduct.id,
              brand: editingProduct.brand,
              model: editingProduct.model,
              icon: editingProduct.icon,
            } : undefined}
            icon={availableIcons[selectedIcon].name}
          />
        </DialogContent>
      </Dialog>

      {/* Icon Selector Dialog */}
      <Dialog open={isIconSelectorOpen} onOpenChange={setIsIconSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Icono</DialogTitle>
            <DialogDescription>
              Elige un icono para el producto
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 py-4">
            {availableIcons.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIcon(index);
                  setIsIconSelectorOpen(false);
                  toast.success(`Icono cambiado a ${item.name}`);
                }}
                className={`p-4 border transition-all ${
                  selectedIcon === index 
                    ? 'border-black bg-gray-100' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                title={item.name}
              >
                {React.createElement(item.Icon, { size: 24 })}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
