'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FiHome, FiRefreshCw, FiAlertCircle, FiZap } from 'react-icons/fi';
import Link from 'next/link';

export default function ErrorPage() {
  const { data: session } = useSession();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icono de error */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-200 dark:border-orange-800">
            <FiAlertCircle className="w-16 h-16 text-orange-600 dark:text-orange-400" />
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1 
          className="text-5xl font-bold text-sidebar-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Error del Servidor
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2 
          className="text-xl font-semibold text-sidebar-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Algo salió mal
        </motion.h2>

        {/* Descripción */}
        <motion.p 
          className="text-muted-foreground mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Lo sentimos, ocurrió un error inesperado. Por favor, intenta de nuevo.
        </motion.p>

        {/* Botones de acción */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={handleRefresh}
            size="lg"
            className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium transition-all duration-200"
          >
            <Link href="/">
              <FiHome className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Link>
          </Button>
        </motion.div>

        {/* Información adicional */}
        <motion.div 
          className="mt-8 p-4 bg-sidebar-accent/30 border border-sidebar-border rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="w-4 h-4 text-sidebar-accent-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">Consejo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}