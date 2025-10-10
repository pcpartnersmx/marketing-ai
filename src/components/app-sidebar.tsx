"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  IconSearch,
  IconUsers,
  IconPackage,
} from "@tabler/icons-react"
import { MdOutlineDashboard } from "react-icons/md";
import { CgMenuGridO } from "react-icons/cg";

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  FiPackage, FiPlus, FiBox, FiShoppingCart, FiShoppingBag, FiTag, FiTruck,
  FiStar, FiHeart, FiGift, FiCpu, FiMonitor, FiSmartphone,
  FiWatch, FiHeadphones, FiCamera, FiAperture, FiZap, FiTrendingUp,
  FiMoreVertical, FiTrash2, FiEdit, FiFileText, FiTarget, FiMail, FiInstagram
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { useProduct } from '@/contexts/product-context';
import { useView } from '@/contexts/view-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Package': FiPackage,
  'Box': FiBox,
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

const data = {
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  navSecondary: [],
}

interface Product {
  id: string;
  brand: string;
  model: string;
  icon?: string;
  researchData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: { email?: string; avatar_url?: string; role?: string }
  selectedProductId?: string | null
  onProductSelect?: (productId: string | null) => void
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  onAddCampaign?: () => void
}

export function AppSidebar({ user, selectedProductId, onProductSelect, onAddProduct, onEditProduct, onDeleteProduct, onAddCampaign, ...props }: AppSidebarProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { setRefreshProducts, productMode, setProductMode } = useProduct();
  const { currentView, setCurrentView } = useView();
  
  // Mock data for blogs
  const blogs = [
    { id: '1', title: 'Guía completa del producto', status: 'published', product: 'Samsung Galaxy S24' },
    { id: '2', title: 'Comparativa detallada', status: 'draft', product: 'iPhone 15 Pro' },
    { id: '3', title: 'Review profundo', status: 'scheduled', product: 'MacBook Pro M3' },
  ];
  
  // Mock data for campaigns
  const campaigns = [
    { id: '1', name: 'Campaña Q4', type: 'ads', status: 'active', product: 'Samsung Galaxy S24' },
    { id: '2', name: 'Email Marketing', type: 'email', status: 'active', product: 'iPhone 15 Pro' },
    { id: '3', name: 'Social Media', type: 'social', status: 'paused', product: 'MacBook Pro M3' },
  ];

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

  // Registrar la función de refresh en el contexto global (solo una vez)
  useEffect(() => {
    setRefreshProducts(fetchProducts);
  }, []); // Dependencia vacía para evitar re-renders infinitos

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const userData = user ? {
    name: user.email?.split('@')[0] || 'Usuario',
    email: user.email || 'usuario@example.com',
    avatar: user.avatar_url || '/avatars/default.jpg',
  } : data.user;

  // Create dynamic navSecondary based on user role
  const navSecondary = user?.role === 'ADMIN' ? [
    {
      title: "Crear Usuario",
      url: "/create-user",
      icon: IconUsers,
    },
  ] : [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="relative">
            <div className="flex items-center gap-2 px-2 py-2">
              <CgMenuGridO  className="h-9 w-9 flex-shrink-0 group/menu-item text-gray-600" />
              <SidebarMenuButton
                asChild
                className="h-12"
              >
                <a href="#" className='flex items-center justify-center'>
                  <img src={'/logo.webp'} className='h-12' alt="Logo" />
                </a>
              </SidebarMenuButton>
            </div>
            <div className="absolute top-full left-0 w-[500px] mt-2 opacity-0 invisible group-hover/menu-item:opacity-100 group-hover/menu-item:visible transition-all duration-300 ease-out transform translate-y-[-10px] group-hover/menu-item:translate-y-0 z-50">
              <div className="bg-[#fafafa] border border-sidebar-border rounded-t-none border-t-0 rounded-xl shadow-xl">
                {/* Header */}
                <div className="px-4 py-3 border-b border-sidebar-border rounded-t-xl">
                  <h3 className="text-sm font-medium text-sidebar-foreground">App Launcher</h3>
                </div>

                {/* Apps Grid */}
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Productos */}
                    <button 
                      onClick={() => setCurrentView('products')}
                      className="flex items-start gap-3 p-3 border border-sidebar-border rounded-lg hover:border-sidebar-accent hover:bg-sidebar-accent transition-all duration-150 text-left group h-28"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                        <FiPackage className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-sidebar-foreground mb-1">Productos</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Investigar y analizar productos específicos para obtener insights detallados</p>
                      </div>
                    </button>

                    {/* Marketing */}
                    <button 
                      onClick={() => setCurrentView('marketing')}
                      className="flex items-start gap-3 p-3 border border-sidebar-border rounded-lg hover:border-sidebar-accent hover:bg-sidebar-accent transition-all duration-150 text-left group h-28"
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                        <FiTrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-sidebar-foreground mb-1">Marketing</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Generar estrategias de marketing personalizadas y campañas efectivas</p>
                      </div>
                    </button>

                    {/* Blogs */}
                    <button 
                      onClick={() => setCurrentView('blogs')}
                      className="flex items-start gap-3 p-3 border border-sidebar-border rounded-lg hover:border-sidebar-accent hover:bg-sidebar-accent transition-all duration-150 text-left group h-28"
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                        <FiEdit className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-sidebar-foreground mb-1">Blogs</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Crear contenido de blog optimizado para productos específicos</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Product Mode Selector - only visible in products view */}
        {currentView === 'products' && (
          <div className="px-4 py-3 border-t border-sidebar-border">
            <Select value={productMode} onValueChange={(value) => setProductMode(value as 'research' | 'datasheet')}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">
                  <div className="flex items-center gap-2">
                    <FiZap className="h-3.5 w-3.5" />
                    <span>Investigación</span>
                  </div>
                </SelectItem>
                <SelectItem value="datasheet">
                  <div className="flex items-center gap-2">
                    <FiFileText className="h-3.5 w-3.5" />
                    <span>Ficha Técnica</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Dynamic Content based on current view */}
        {currentView === 'products' && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground">Productos</SidebarGroupLabel>
              {user?.role === 'ADMIN' && onAddProduct && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddProduct}
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                >
                  <FiPlus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Cargando...
                    </div>
                  </SidebarMenuItem>
                ) : products.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Sin productos
                    </div>
                  </SidebarMenuItem>
                ) : (
                  products.map((product) => {
                    const IconComponent = iconMap[product.icon || 'Package'] || FiPackage;

                    return (
                      <SidebarMenuItem key={product.id}>
                        <div className="flex items-center gap-1 w-full">
                          <SidebarMenuButton
                            onClick={() => onProductSelect?.(product.id)}
                            isActive={selectedProductId === product.id}
                            className="flex items-center gap-2 flex-1"
                          >
                            <IconComponent className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm">{product.brand}</div>
                              <div className="text-xs text-muted-foreground truncate">{product.model}</div>
                            </div>
                            {product.researchData && (
                              <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
                                ✓
                              </Badge>
                            )}
                          </SidebarMenuButton>
                          {user?.role === 'ADMIN' && (onEditProduct || onDeleteProduct) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-sidebar-accent"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FiMoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onEditProduct && (
                                  <DropdownMenuItem onClick={() => onEditProduct(product)}>
                                    <FiEdit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {onDeleteProduct && (
                                  <DropdownMenuItem
                                    onClick={() => onDeleteProduct(product.id)}
                                    className="text-red-600"
                                  >
                                    <FiTrash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Blogs Section */}
        {currentView === 'blogs' && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground">Blogs</SidebarGroupLabel>
              {user?.role === 'ADMIN' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                >
                  <FiPlus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {blogs.map((blog) => {
                  const statusColors = {
                    published: 'bg-green-500/10 text-green-600 border-green-500/20',
                    draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
                    scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                  };

                  return (
                    <SidebarMenuItem key={blog.id}>
                      <SidebarMenuButton className="flex items-start gap-2 h-auto py-2">
                        <FiFileText className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{blog.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{blog.product}</div>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-[10px] px-1 py-0 h-4 ${statusColors[blog.status as keyof typeof statusColors]}`}
                          >
                            {blog.status === 'published' ? 'Publicado' : blog.status === 'draft' ? 'Borrador' : 'Programado'}
                          </Badge>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Marketing Section */}
        {currentView === 'marketing' && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground">Campañas</SidebarGroupLabel>
              {user?.role === 'ADMIN' && onAddCampaign && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddCampaign}
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                >
                  <FiPlus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {campaigns.map((campaign) => {
                  const typeIcons = {
                    email: <FiMail className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />,
                    social: <FiInstagram className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />,
                    ads: <FiTarget className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />,
                  };

                  const statusColors = {
                    active: 'bg-green-500/10 text-green-600 border-green-500/20',
                    paused: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                    completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
                  };

                  return (
                    <SidebarMenuItem key={campaign.id}>
                      <SidebarMenuButton className="flex items-start gap-2 h-auto py-2">
                        {typeIcons[campaign.type as keyof typeof typeIcons]}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{campaign.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{campaign.product}</div>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-[10px] px-1 py-0 h-4 ${statusColors[campaign.status as keyof typeof statusColors]}`}
                          >
                            {campaign.status === 'active' ? 'Activa' : campaign.status === 'paused' ? 'Pausada' : 'Completada'}
                          </Badge>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
