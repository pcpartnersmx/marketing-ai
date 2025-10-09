'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Test404() {
  const router = useRouter();

  useEffect(() => {
    // Simular una página que no existe
    router.push('/pagina-que-no-existe');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-sidebar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo a página 404...</p>
      </div>
    </div>
  );
}
