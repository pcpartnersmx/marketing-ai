'use client';

import { useEffect, useCallback } from 'react';

export function useCommandPalette(
  isOpen: boolean,
  onOpenChange: (open: boolean) => void
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for Ctrl+Space
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        onOpenChange(!isOpen);
      }
      
      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onOpenChange(false);
      }
    },
    [isOpen, onOpenChange]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isOpen,
    onOpenChange,
  };
}
