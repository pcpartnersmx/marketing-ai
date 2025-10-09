'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FiHome, FiAlertTriangle, FiArrowLeft, FiZap } from 'react-icons/fi';
import Link from 'next/link';

export default function NotFound() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icono de error con diseño consistente */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          <div className="w-32 h-32 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-800">
            <FiAlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        {/* Título con estilo consistente */}
        <motion.h1 
          className="text-6xl font-bold text-sidebar-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          404
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2 
          className="text-2xl font-semibold text-sidebar-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Página no encontrada
        </motion.h2>

        {/* Descripción */}
        <motion.p 
          className="text-muted-foreground mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </motion.p>

        {/* Botones de acción con estilo consistente */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/">
              <FiHome className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium transition-all duration-200"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Volver Atrás
          </Button>
        </motion.div>

        {/* Información adicional para usuarios autenticados */}
        {session && (
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
              Si crees que esto es un error, puedes usar el sidebar para navegar a tus proyectos o crear uno nuevo.
            </p>
          </motion.div>
        )}

        {/* Información para usuarios no autenticados */}
        {!session && (
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
              Si necesitas acceder a la aplicación, asegúrate de estar logueado correctamente.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
