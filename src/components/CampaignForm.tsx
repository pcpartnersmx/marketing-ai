"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FiMail, FiInstagram, FiTarget } from 'react-icons/fi';

interface Product {
    id: string;
    brand: string;
    model: string;
    researchData: Record<string, unknown> | null;
}

interface CampaignFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        type: 'ads' as 'email' | 'social' | 'ads',
        productId: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Error al cargar productos');
            const data = await response.json();
            // Filtrar solo productos con investigación
            const productsWithResearch = data.filter((product: Product) => product.researchData !== null);
            setProducts(productsWithResearch);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implementar la creación de campaña
        console.log('Campaign data:', formData);

        // Simular éxito
        setTimeout(() => {
            setLoading(false);
            onSuccess?.();
        }, 1000);
    };

    const campaignTypes = [
        { value: 'ads', label: 'Publicidad', icon: FiTarget },
        { value: 'email', label: 'Email Marketing', icon: FiMail },
        { value: 'social', label: 'Redes Sociales', icon: FiInstagram },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Campaña</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Campaña Lanzamiento Q4"
                        required
                    />
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Campaña</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as 'email' | 'social' | 'ads' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {campaignTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Producto */}
                <div className="space-y-2">
                    <Label htmlFor="product">Producto</Label>
                    <Select
                        value={formData.productId}
                        onValueChange={(value) => setFormData({ ...formData, productId: value })}
                        disabled={loadingProducts}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={loadingProducts ? "Cargando productos..." : "Selecciona un producto"} />
                        </SelectTrigger>
                        <SelectContent>
                            {products.length === 0 ? (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    No hay productos con investigación
                                </div>
                            ) : (
                                products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.brand} {product.model}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {products.length === 0 && !loadingProducts && (
                        <p className="text-xs text-muted-foreground">
                            Los productos necesitan tener investigación completada
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading || products.length === 0}
                    className="bg-black hover:bg-black/90 text-white"
                >
                    {loading ? 'Creando...' : 'Crear Campaña'}
                </Button>
            </div>
        </form>
    );
}

