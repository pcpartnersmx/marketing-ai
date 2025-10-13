"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiFileText, 
  FiCheck, 
  FiShoppingCart, 
  FiShoppingBag, 
  FiTag, 
  FiTruck, 
  FiStar, 
  FiHeart, 
  FiGift, 
  FiCpu, 
  FiMonitor, 
  FiSmartphone, 
  FiWatch, 
  FiHeadphones, 
  FiCamera, 
  FiAperture, 
  FiZap, 
  FiTrendingUp,
  FiChevronRight,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProduct } from '@/contexts/product-context';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Product } from '@prisma/client';

interface ProductsKanbanProps {
  userRole?: string;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string | null) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Package': FiPackage,
  'Box': FiPackage,
  'Shopping Cart': FiShoppingCart,
  'Shopping Bag': FiShoppingBag,
  'Tag': FiTag,
  'Truck': FiTruck,
  'Star': FiStar,
  'Heart': FiHeart,
  'Gift': FiGift,
  'CPU': FiCpu,
  'Monitor': FiMonitor,
  'Smartphone': FiSmartphone,
  'Watch': FiWatch,
  'Headphones': FiHeadphones,
  'Camera': FiCamera,
  'Aperture': FiAperture,
  'Zap': FiZap,
  'Trending Up': FiTrendingUp,
};

function KanbanSkeleton() {
  return (
    <div className="flex gap-6 h-full">
      {/* Columna 1 Skeleton */}
      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg p-4 border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Columna 2 Skeleton */}
      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg p-4 border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsKanban({ 
  userRole, 
  selectedProductId, 
  onProductSelect,
  onEditProduct,
  onDeleteProduct
}: ProductsKanbanProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinishedExpanded, setIsFinishedExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { setRefreshProducts, refreshAllProducts } = useProduct();
  const isAdmin = userRole === 'ADMIN';

  // Registrar la función de refresh en el contexto
  React.useEffect(() => {
    setRefreshProducts(fetchProducts);
  }, [setRefreshProducts]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  // const handleProductClick = (product: Product) => {
  //   onProductSelect?.(product.id);
  // };


  // Función de filtrado por búsqueda
  const filterProducts = (productList: Product[]) => {
    if (!searchTerm) return productList;
    return productList.filter(product => 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filtrar productos según su estado
  const allProductsWithoutDatasheet = products.filter(product => !product.datasheetContent && product.researchData && !product.finished);
  const allProductsWithDatasheet = products.filter(product => product.datasheetContent && !product.finished);
  const allFinishedProducts = products.filter(product => product.finished);
  
  // Aplicar filtro de búsqueda
  const productsWithoutDatasheet = filterProducts(allProductsWithoutDatasheet);
  const productsWithDatasheet = filterProducts(allProductsWithDatasheet);
  const finishedProducts = filterProducts(allFinishedProducts);

  if (loading) {
    return <KanbanSkeleton />;
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const IconComponent = iconMap[product.icon || 'Package'] || FiPackage;
    const isSelected = selectedProductId === product.id;
    
    const handleCardClick = () => {
      onProductSelect?.(isSelected ? null : product.id);
    };
    
    // Calcular progreso basado en el estado
    const getProgressInfo = () => {
      if (product.datasheetContent) {
        return { progress: 100, label: 'Completo', color: 'green' };
      } else if (product.researchData) {
        return { progress: 50, label: 'Investigado', color: 'blue' };
      } else {
        return { progress: 0, label: 'Pendiente', color: 'gray' };
      }
    };
    
    const progressInfo = getProgressInfo();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className={`
            bg-white/80 backdrop-blur-sm border rounded-lg p-2.5 shadow-md 
            transition-all duration-200 cursor-pointer group
            ${isSelected 
              ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
              : 'border-gray-200/50 hover:shadow-lg hover:border-gray-300'
            }
          `}
          onClick={handleCardClick}
        >
          {/* Header con icono e información */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`
              p-1.5 rounded-md flex-shrink-0 transition-colors
              ${isSelected ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-150'}
            `}>
              <IconComponent className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-medium text-sm truncate transition-colors
                ${isSelected ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {product.brand}
              </h3>
              <p className="text-xs text-gray-500 truncate">{product.model}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge 
                variant="outline" 
                className={`
                  text-xs px-2 py-0.5
                  ${progressInfo.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                    progressInfo.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }
                `}
              >
                {progressInfo.label}
              </Badge>
              
              {/* Menú de acciones */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiMoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductSelect?.(product.id);
                      }}
                    >
                      <FiEye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct?.(product);
                      }}
                    >
                      <FiEdit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProduct?.(product.id);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <div className="text-xs text-gray-400">
                {new Date(product.createdAt).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
            <div 
              className={`
                h-1 rounded-full transition-all duration-300
                ${progressInfo.color === 'green' ? 'bg-green-500' :
                  progressInfo.color === 'blue' ? 'bg-blue-500' :
                  'bg-gray-400'
                }
              `}
              style={{ width: `${progressInfo.progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const FinishedProductCard = ({ product }: { product: Product }) => {
    const IconComponent = iconMap[product.icon || 'Package'] || FiPackage;
    const isSelected = selectedProductId === product.id;
    
    const handleCardClick = () => {
      onProductSelect?.(isSelected ? null : product.id);
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className={`
            bg-white/60 backdrop-blur-sm border rounded-lg p-2 shadow-sm 
            transition-all duration-200 cursor-pointer group
            ${isSelected 
              ? 'border-green-500 shadow-md ring-2 ring-green-200 opacity-100' 
              : 'border-gray-200/30 opacity-90 hover:opacity-100 hover:shadow-md'
            }
          `}
          onClick={handleCardClick}
        >
          {/* Header compacto con icono y estado */}
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`
              p-1 rounded-md flex-shrink-0 transition-colors
              ${isSelected ? 'bg-green-200' : 'bg-green-100 group-hover:bg-green-150'}
            `}>
              <IconComponent className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-medium text-xs truncate transition-colors
                ${isSelected ? 'text-green-700' : 'text-gray-400'}
              `}>
                {product.brand}
              </h3>
              <p className="text-xs text-gray-400 truncate">{product.model}</p>
            </div>
          </div>
          
          {/* Estado y fecha en una línea */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-400">Finalizado</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(product.updatedAt).toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 rounded-2xl -z-10"></div>
      
      {/* Header Section */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
              <FiPackage className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600 text-sm">
                Gestiona tus productos organizados por estado de desarrollo
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress bar mejorada */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
            style={{
              width: `${(productsWithoutDatasheet.length + productsWithDatasheet.length) > 0 ? (productsWithDatasheet.length / (productsWithoutDatasheet.length + productsWithDatasheet.length)) * 100 : 0}%`
            }}
          ></div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar productos por marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-9 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas del progreso */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{productsWithoutDatasheet.length} Sin ficha técnica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>{productsWithDatasheet.length} Con ficha técnica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{finishedProducts.length} Finalizados</span>
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2 text-blue-600">
              <FiFilter className="h-3 w-3" />
              <span>Filtrando por: &quot;{searchTerm}&quot;</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="relative flex gap-4 h-[calc(100vh-360px)] lg:h-[calc(100vh-300px)]">
        {/* Columnas principales a la izquierda */}
        <div className="flex gap-4 flex-1">
          {/* Columna 1: Sin Ficha Técnica */}
          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 h-full flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <FiPackage className="h-5 w-5 text-blue-500" />
                    Sin Ficha Técnica
                  </h2>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  {productsWithoutDatasheet.length}
                </Badge>
              </div>
              
              <div className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {productsWithoutDatasheet.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="p-4 bg-gray-100/50 rounded-2xl mb-4">
                        <FiPackage className="h-12 w-12 mx-auto opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No hay productos investigados sin ficha técnica</p>
                    </div>
                  </div>
                ) : (
                  productsWithoutDatasheet.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna 2: Con Ficha Técnica */}
          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 h-full flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-blue-500" />
                    Con Ficha Técnica
                  </h2>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  {productsWithDatasheet.length}
                </Badge>
              </div>
              
              <div className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
                {productsWithDatasheet.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="p-4 bg-gray-100/50 rounded-2xl mb-4">
                        <FiFileText className="h-12 w-12 mx-auto opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No hay productos con ficha técnica pendiente</p>
                    </div>
                  </div>
                ) : (
                  productsWithDatasheet.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3: Finalizados - Colapsible */}
        <motion.div 
          className="flex flex-col transition-all duration-300"
          animate={{ 
            width: isFinishedExpanded ? '400px' : '80px',
            flex: isFinishedExpanded ? '0 0 400px' : '0 0 80px'
          }}
        >
          <div className="bg-white/90 opacity-60 hover:opacity-100 transition-all duration-300 backdrop-blur-sm rounded-2xl border border-gray-200/50 h-full flex flex-col shadow-xl relative overflow-hidden">
            
            {/* Estado Colapsado */}
            {!isFinishedExpanded && (
              <div className="flex items-center justify-center h-full p-2 cursor-pointer" onClick={() => setIsFinishedExpanded(true)}>
                <div className="flex items-center justify-center">
                  {/* Texto vertical */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-2  text-2xl ">
                      {['F', 'I', 'N', 'A', 'L', 'I', 'Z', 'A', 'D', 'O', 'S'].map((letter, index) => (
                        <div key={index} className='text-center'>{letter}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contador */}
                  {/* <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">{finishedProducts.length}</span>
                  </div> */}
                </div>
              </div>
            )}

            {/* Estado Expandido */}
            {isFinishedExpanded && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                    <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <FiCheck className="h-5 w-5 text-green-500" />
                      Finalizados
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold">
                      {finishedProducts.length}
                    </Badge>
                    <Button
                      onClick={() => setIsFinishedExpanded(false)}
                      className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200"
                      variant="ghost"
                    >
                      <FiChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
                  {finishedProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="p-4 bg-gray-100/50 rounded-2xl mb-4">
                          <FiCheck className="h-12 w-12 mx-auto opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No hay productos finalizados</p>
                      </div>
                    </div>
                  ) : (
                    finishedProducts.map((product) => (
                      <FinishedProductCard key={product.id} product={product} />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
