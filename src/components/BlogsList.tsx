"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiPlus, FiFileText, FiCalendar, FiUser } from 'react-icons/fi';

interface Blog {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  product?: string;
  author: string;
  date: string;
  wordCount: number;
}

interface BlogsListProps {
  userRole?: string;
}

export function BlogsList({ userRole }: BlogsListProps) {
  const [blogs] = useState<Blog[]>([
    {
      id: '1',
      title: 'Guía completa: Características principales del producto',
      status: 'published',
      product: 'Samsung Galaxy S24',
      author: 'Usuario',
      date: '2024-10-05',
      wordCount: 1250,
    },
    {
      id: '2',
      title: 'Comparativa: Samsung vs Apple',
      status: 'draft',
      product: 'Samsung Galaxy S24',
      author: 'Usuario',
      date: '2024-10-08',
      wordCount: 890,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: 'bg-green-500/10 text-green-600 border-green-500/20',
      draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : 'Programado'}
      </Badge>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blogs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona y crea contenido de blog para tus productos
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <Button className="bg-black hover:bg-black/90 text-white">
            <FiPlus className="mr-2 h-4 w-4" />
            Nuevo Blog
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog, index) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="border border-border hover:border-border/60 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{blog.title}</h3>
                    {getStatusBadge(blog.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {blog.product && (
                    <div className="flex items-center gap-2">
                      <FiFileText className="h-3 w-3" />
                      <span>{blog.product}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiUser className="h-3 w-3" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="h-3 w-3" />
                    <span>{new Date(blog.date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {blog.wordCount.toLocaleString()} palabras
                  </div>
                </div>
                
                {userRole === 'ADMIN' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" className="flex-1 h-8">
                      <FiEdit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50">
                      <FiTrash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FiFileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay blogs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comienza creando tu primer blog
                </p>
                {userRole === 'ADMIN' && (
                  <Button>
                    <FiPlus className="mr-2 h-4 w-4" />
                    Crear Blog
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

