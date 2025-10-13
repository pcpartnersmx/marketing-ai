"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FiArrowLeft, FiSettings, FiEdit3, FiFileText, FiCheck, FiRefreshCw, FiClipboard, FiBriefcase, FiBarChart, FiSmartphone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import { Product } from '@prisma/client';

interface ProductDetailViewProps {
  product: Product;
  userRole?: string;
  onBack: () => void;
  onUpdate: () => void;
}

export function ProductDetailView({ product, userRole, onBack, onUpdate }: ProductDetailViewProps) {
  const [activeTab, setActiveTab] = useState('formulario');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const debouncedPrompt = useDebounce(prompt, 1000);

  const isAdmin = userRole === 'ADMIN';

  // Resetear estados cuando cambia el producto
  useEffect(() => {
    // Cargar datos del nuevo producto
    if (product.researchData) {
      setResult(typeof product.researchData === 'string' ? product.researchData : JSON.stringify(product.researchData, null, 2));
    } else {
      setResult('');
    }

    // Cargar prompt personalizado o limpiar
    if (product.customPrompt) {
      setPrompt(product.customPrompt);
    } else {
      setPrompt('');
    }

    // Resetear estados de guardado
    setSaveStatus('idle');
  }, [product.id, product.researchData, product.customPrompt]);

  // Auto-guardar el prompt con debounce
  useEffect(() => {
    if (debouncedPrompt && debouncedPrompt !== product.customPrompt && activeTab === 'editor') {
      savePrompt(debouncedPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrompt, activeTab]);

  const savePrompt = async (promptToSave: string) => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const response = await fetch(`/api/products/${product.id}/prompt`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToSave }),
      });

      if (!response.ok) throw new Error('Error al guardar prompt');

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Error al guardar el prompt');
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSystemPrompt = async () => {
    if (prompt) return; // Si ya hay un prompt, no cargar de nuevo

    setIsLoadingPrompt(true);
    try {
      const response = await fetch('/api/system-prompts?systemType=PRODUCTS');
      if (response.ok) {
        const data = await response.json();
        if (data?.prompt) {
          setPrompt(data.prompt);
        }
      }
    } catch (error) {
      console.error('Error loading system prompt:', error);
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleGenerateResearch = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, ingresa un prompt para la investigación');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/products/${product.id}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Error al generar investigación');

      const data = await response.json();

      // Actualizar el resultado con los datos de investigación
      if (data.researchData) {
        const resultText = typeof data.researchData === 'string'
          ? data.researchData
          : JSON.stringify(data.researchData, null, 2);
        setResult(resultText);
      }

      toast.success('Investigación generada exitosamente');

      // Cambiar a la tab de resultado automáticamente
      setActiveTab('resultado');

      onUpdate();
    } catch (error) {
      console.error('Error generating research:', error);
      toast.error('Error al generar investigación');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderResearchData = (data: Record<string, unknown> | null) => {
    if (!data) return <p className="text-muted-foreground">No hay datos disponibles</p>;

    if ('raw' in data && typeof data.raw === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
            {data.raw}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-sm capitalize border-b pb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            {Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {value.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {typeof item === 'object' ? JSON.stringify(item) : item}
                  </li>
                ))}
              </ul>
            ) : typeof value === 'object' && value !== null ? (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <FiArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{product.brand} {product.model}</h2>
            <p className="text-sm text-muted-foreground">
              {product.researchData ? 'Investigación completada' : 'Pendiente de investigación'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product.researchData && (
            <Badge className="bg-green-500">
              <FiCheck className="h-3 w-3 mr-1" />
              Investigado
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="w-full">
        <div className="inline-block bg-gray-100 rounded-lg p-1 w-full">
          <div className="flex">
            <button
              onClick={() => setActiveTab('formulario')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'formulario'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
            >
              <FiSettings className="h-4 w-4" />
              Formulario
            </button>
            <button
              onClick={() => {
                setActiveTab('editor');
                loadSystemPrompt();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'editor'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
            >
              <FiEdit3 className="h-4 w-4" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('resultado')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resultado'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
            >
              <FiFileText className="h-4 w-4" />
              Resultado
            </button>
          </div>
        </div>
      </div>

      {/* Formulario Tab */}
      {activeTab === 'formulario' && (
        <div className="space-y-6 mt-6">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
                Formulario
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Completa los campos para generar el prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="producto" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-red-500 text-lg">!</span>
                  Producto/Servicio <span className="text-red-500">(requerido)</span>
                </Label>
                <Input
                  id="producto"
                  value={product.brand}
                  readOnly
                  placeholder="Ej: Aplicación móvil de fitness"
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="modelo" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-red-500 text-lg">!</span>
                  Modelo <span className="text-red-500">(requerido)</span>
                </Label>
                <Input
                  id="modelo"
                  value={product.model}
                  readOnly
                  placeholder="Ingresa modelo"
                  className="bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de respuesta:</Label>
                <div className="flex">
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Respuesta IA
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => {
                  setActiveTab('editor');
                  loadSystemPrompt();
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg h-12 text-sm font-medium"
                disabled={!isAdmin}
              >
                Generar Respuesta IA
                <FiRefreshCw className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Editor Tab */}
      {activeTab === 'editor' && (
        <div className="flex gap-10">
          {/* Editor Principal */}
          <div className="lg:col-span-2 w-[80%] ">
            <Card className='h-full'>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEdit3 className="h-5 w-5 text-orange-500" />
                    Editor de Prompt
                  </div>
                  {saveStatus === 'saving' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                      Guardando...
                    </div>
                  )}
                  {saveStatus === 'saved' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FiCheck className="h-4 w-4" />
                      Guardado
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Personaliza el prompt para la investigación del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 h-full">
                <div className="space-y-2 h-[90%]">
                  <Label htmlFor="prompt">Prompt personalizado</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    placeholder={isLoadingPrompt ? "Cargando prompt del sistema..." : "Genera la descripción detallada de un producto para publicarse en tienda en línea..."}
                    className="h-[90%] max-h-[95%]"
                    disabled={isLoadingPrompt}
                  />
                  {isLoadingPrompt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                      Cargando prompt del sistema...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateResearch}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="h-4 w-4 mr-2" />
                        Generar Investigación
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('resultado')}
                    disabled={!result}
                  >
                    Ver Resultado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Variables Disponibles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Variables Disponibles</CardTitle>
                <CardDescription className="text-xs">
                  Puedes usar estas variables en tu prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <code className="text-xs font-mono">{'{brand}'}</code>
                    <span className="text-xs text-muted-foreground">{product.brand}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <code className="text-xs font-mono">{'{model}'}</code>
                    <span className="text-xs text-muted-foreground">{product.model}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Las variables se reemplazarán automáticamente con los valores del producto.
                </p>
              </CardContent>
            </Card>

            {/* Plantillas Rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Plantillas Rápidas</CardTitle>
                <CardDescription className="text-xs">
                  Selecciona una plantilla para empezar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setPrompt(`Eres un investigador experto de productos. Analiza en detalle el producto {brand} {model} y proporciona un informe completo que incluya:

1. Descripción general del producto
2. Características principales y funcionalidades
3. Especificaciones técnicas detalladas
4. Información de precio y disponibilidad en el mercado
5. Análisis de ventajas y desventajas
6. Comparación con principales competidores

Proporciona toda la información de forma clara, estructurada y profesional.`)}
                >
                  <FiClipboard className="h-3 w-3 mr-2" />
                  Análisis Completo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setPrompt(`Crea una descripción comercial persuasiva y atractiva para {brand} {model} que incluya:

- Título impactante que capture la atención
- Beneficios clave para el cliente
- Características destacadas del producto
- Propuesta de valor única
- Llamada a la acción efectiva

Redacta el texto de manera fluida, natural y orientada a maximizar conversiones.`)}
                >
                  <FiBriefcase className="h-3 w-3 mr-2" />
                  Descripción Comercial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setPrompt(`Realiza una investigación profunda de mercado para {brand} {model} que incluya:

1. Análisis detallado de la competencia directa e indirecta
2. Posicionamiento actual en el mercado
3. Rangos de precios y estrategias de pricing
4. Tendencias actuales del sector
5. Segmento objetivo y público meta
6. Oportunidades de diferenciación y mejora

Presenta la información de manera estructurada y accionable.`)}
                >
                  <FiBarChart className="h-3 w-3 mr-2" />
                  Análisis de Mercado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setPrompt(`Genera contenido atractivo y listo para publicar en redes sociales sobre {brand} {model}:

- Post completo para Instagram (con emojis y gancho emocional)
- Tweet optimizado para Twitter (conciso e impactante)
- Publicación para Facebook (detallada y conversacional)
- Lista de hashtags relevantes y populares
- Sugerencias de imágenes o elementos visuales

Adapta el tono y estilo a cada plataforma para maximizar el engagement.`)}
                >
                  <FiSmartphone className="h-3 w-3 mr-2" />
                  Contenido Social
                </Button>
              </CardContent>
            </Card>

            {/* Estadísticas del Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Caracteres:</span>
                  <span className="font-mono">{prompt.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Palabras:</span>
                  <span className="font-mono">{prompt.trim() ? prompt.trim().split(/\s+/).length : 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Líneas:</span>
                  <span className="font-mono">{prompt.split('\n').length}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* Resultado Tab */}
      {activeTab === 'resultado' && (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiFileText className="h-5 w-5 text-green-500" />
                Resultado de la Investigación
              </CardTitle>
              <CardDescription>
                Información generada automáticamente con IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm bg-muted p-6 rounded-lg leading-relaxed">
                    {(() => {
                      try {
                        const parsed = JSON.parse(result);
                        if (parsed.raw) {
                          return parsed.raw;
                        }
                        return result;
                      } catch {
                        return result;
                      }
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FiFileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay resultado disponible</p>
                  <p className="text-sm">Genera una investigación para ver el resultado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
