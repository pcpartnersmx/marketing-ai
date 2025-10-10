"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CampaignForm } from './CampaignForm';
import { 
  FiPlus, 
  FiTrendingUp, 
  FiMail, 
  FiInstagram, 
  FiTarget,
  FiBarChart2,
  FiUsers,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads';
  status: 'active' | 'paused' | 'completed';
  product?: string;
  reach: number;
  conversions: number;
  startDate: string;
}

interface MarketingViewProps {
  userRole?: string;
  isFormOpen?: boolean;
  onFormOpenChange?: (open: boolean) => void;
}

export function MarketingView({ userRole, isFormOpen = false, onFormOpenChange }: MarketingViewProps) {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Campaña Lanzamiento Q4',
      type: 'ads',
      status: 'active',
      product: 'Samsung Galaxy S24',
      reach: 125000,
      conversions: 1250,
      startDate: '2024-10-01',
    },
    {
      id: '2',
      name: 'Email Marketing - Descuentos',
      type: 'email',
      status: 'active',
      product: 'iPhone 15 Pro',
      reach: 45000,
      conversions: 890,
      startDate: '2024-10-05',
    },
  ]);

  const getCampaignIcon = (type: string) => {
    const icons = {
      email: <FiMail className="h-4 w-4" />,
      social: <FiInstagram className="h-4 w-4" />,
      ads: <FiTarget className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-500/20',
      paused: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status === 'active' ? 'Activa' : status === 'paused' ? 'Pausada' : 'Completada'}
      </Badge>
    );
  };

  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona campañas y estrategias de marketing
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <Button 
            className="bg-black hover:bg-black/90 text-white"
            onClick={() => onFormOpenChange?.(true)}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alcance Total</p>
                <p className="text-2xl font-semibold">{(totalReach / 1000).toFixed(1)}K</p>
              </div>
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Conversiones</p>
                <p className="text-2xl font-semibold">{totalConversions.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="border border-border hover:border-border/60 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getCampaignIcon(campaign.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      
                      {campaign.product && (
                        <p className="text-xs text-muted-foreground mb-3">{campaign.product}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Alcance</p>
                          <p className="font-medium">{(campaign.reach / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Conversiones</p>
                          <p className="font-medium">{campaign.conversions.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {userRole === 'ADMIN' && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" className="h-8">
                        <FiEdit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50">
                        <FiTrash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Empty State */}
        {campaigns.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FiTrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay campañas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comienza creando tu primera campaña de marketing
              </p>
              {userRole === 'ADMIN' && (
                <Button onClick={() => onFormOpenChange?.(true)}>
                  <FiPlus className="mr-2 h-4 w-4" />
                  Crear Campaña
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Campaign Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={onFormOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Campaña</DialogTitle>
            <DialogDescription>
              Crea una nueva campaña de marketing para promocionar tus productos
            </DialogDescription>
          </DialogHeader>
          <CampaignForm
            onSuccess={() => {
              onFormOpenChange?.(false);
              // TODO: Refresh campaigns list
            }}
            onCancel={() => onFormOpenChange?.(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

