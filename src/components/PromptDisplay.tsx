'use client';

import { useState, useEffect, useRef } from 'react';
import { FiCopy, FiCheck, FiFileText, FiRotateCcw, FiArrowLeft, FiZap, FiRefreshCw, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PromptDisplayProps = {
  prompt: string;
  aiResponse?: string;
  responseMode?: 'PROMPT' | 'AI_RESPONSE';
  isStreamingAI?: boolean;
  onGenerate: () => void;
  onBack: () => void;
  onReset: () => void;
  onSwitchToResult?: () => void;
};

export default function PromptDisplay({ prompt, aiResponse: propAiResponse, responseMode, isStreamingAI = false, onGenerate, onBack, onReset, onSwitchToResult }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localAiResponse, setLocalAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseCopied, setResponseCopied] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const mainResponseRef = useRef<HTMLDivElement>(null);

  // Use prop AI response if available, otherwise use local state
  const displayAiResponse = propAiResponse || localAiResponse;

  // Auto-scroll al final del texto cuando se actualiza la respuesta
  useEffect(() => {
    const scrollToBottom = (element: HTMLDivElement) => {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 10);
    };

    if (displayAiResponse) {
      // Scroll en el contenedor principal
      if (mainResponseRef.current) {
        scrollToBottom(mainResponseRef.current);
      }
      // Scroll en el modal
      if (responseRef.current) {
        scrollToBottom(responseRef.current);
      }
    }
  }, [displayAiResponse, isStreamingAI]);

  // Scroll suave durante el streaming
  useEffect(() => {
    if (isStreamingAI) {
      const scrollToBottomSmooth = (element: HTMLDivElement) => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      };

      const scrollBothContainers = () => {
        if (mainResponseRef.current) {
          scrollToBottomSmooth(mainResponseRef.current);
        }
        if (responseRef.current) {
          scrollToBottomSmooth(responseRef.current);
        }
      };
      
      // Scroll cada vez que se actualiza el contenido durante streaming
      const interval = setInterval(scrollBothContainers, 200);
      
      return () => clearInterval(interval);
    }
  }, [isStreamingAI]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(displayAiResponse);
      setResponseCopied(true);
      setTimeout(() => setResponseCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!prompt) return;
    
    // Para proyectos AI_RESPONSE, cambiar a la tab de resultado inmediatamente
    if (responseMode === 'AI_RESPONSE' && onSwitchToResult) {
      onSwitchToResult();
    }
    
    setIsLoading(true);
    setIsSearchingWeb(true);
    setIsModalOpen(true);
    setLocalAiResponse(''); // Limpiar respuesta anterior
    
    try {
      const response = await fetch('/api/openAi/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar respuesta con AI');
      }

      // Handle streaming text response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setLocalAiResponse(fullResponse);
          
          // Simular que la búsqueda web toma tiempo
          if (fullResponse.length > 100 && isSearchingWeb) {
            setTimeout(() => setIsSearchingWeb(false), 2000);
          }
        }
      }
      
      setIsLoading(false);
      setIsSearchingWeb(false);
    } catch (error) {
      console.error('Error:', error);
      setLocalAiResponse('Error al generar respuesta con AI. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
      setIsSearchingWeb(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiZap className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {responseMode === 'AI_RESPONSE' ? 'Respuesta Generada' : 'Prompt Generado'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <FiArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <FiRotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {!prompt && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Genera tu prompt</h3>
              <Button onClick={onGenerate} size="lg">
                <FiZap className="w-4 h-4 mr-2" />
                Generar Prompt
              </Button>
            </div>
          </div>
        )}

        {prompt && (
          <div className="flex-1 flex flex-col">
            {/* Show Prompt Display Card only for PROMPT projects */}
            {responseMode !== 'AI_RESPONSE' && (
              <div className="flex-1 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Prompt Final</h3>
                  <Button
                    onClick={handleCopy}
                    variant={copied ? "default" : "outline"}
                    size="sm"
                    className={copied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-4 min-h-[200px]">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    
                    {prompt}
                  </div>
                </div>
              </div>
            )}

            {/* AI Response Section - Clean and minimal */}
            {responseMode === 'AI_RESPONSE' && (displayAiResponse || isStreamingAI) && (
              <div className="flex-1 mb-4 max-h-[65vh] overflow-y-auto">
                {isStreamingAI && !displayAiResponse ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {isSearchingWeb ? 'Buscando información en internet...' : 'Generando respuesta...'}
                      </p>
                    </div>
                  </div>
                ) : displayAiResponse ? (
                  <div className="relative group">
                    <button 
                      onClick={handleCopyResponse}
                      className={`sticky opacity-0 group-hover:opacity-100 transition-all duration-200 top-2 left-full -translate-x-2 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm z-10 ${
                        responseCopied 
                          ? 'bg-green-600/90 border-green-600 text-white hover:bg-green-700/90' 
                          : 'bg-background/90 border-border text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {responseCopied ? (
                        <>
                          <FiCheck className="w-3 h-3 mr-1 inline" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3 h-3 mr-1 inline" />
                          Copiar
                        </>
                      )}
                    </button>
                    <div ref={mainResponseRef} className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {displayAiResponse}
                      {isStreamingAI && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </div>
                    {isStreamingAI && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <FiRefreshCw className="w-3 h-3 animate-spin mr-1" />
                        <span>Escribiendo en tiempo real...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">No hay respuesta disponible</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* AI Response Modal - Simplified */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiZap className="w-5 h-5 text-primary" />
              Respuesta Generada con AI
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* Response Section */}
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Respuesta de AI:</h4>
                {displayAiResponse && !isLoading && (
                  <Button
                    onClick={handleCopyResponse}
                    variant={responseCopied ? "default" : "outline"}
                    size="sm"
                    className={responseCopied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
                  >
                    {responseCopied ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div ref={responseRef} className="flex-1 bg-muted/20 rounded-lg p-4 overflow-y-auto">
                {isLoading && !displayAiResponse ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Iniciando generación...</p>
                    </div>
                  </div>
                ) : displayAiResponse ? (
                  <div className="relative">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {displayAiResponse}
                      {isLoading && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </div>
                    {isLoading && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <FiRefreshCw className="w-3 h-3 animate-spin mr-1" />
                        <span>Escribiendo en tiempo real...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">No hay respuesta disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX className="w-4 h-4 mr-1" />
                Cerrar
              </Button>
              {displayAiResponse && !isLoading && (
                <Button onClick={handleCopyResponse}>
                  <FiCopy className="w-4 h-4 mr-1" />
                  Copiar Respuesta
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
