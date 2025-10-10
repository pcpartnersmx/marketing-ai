"use client"

import { useEffect, useState } from 'react';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Space para abrir el command palette
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        setIsOpen(true);
      }

      // Escape para cerrar
      if (event.code === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCommandPalette = () => setIsOpen(true);
  const closeCommandPalette = () => setIsOpen(false);

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
  };
}
