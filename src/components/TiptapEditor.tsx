'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  FiBold, 
  FiItalic, 
  FiList, 
  FiCode,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiCopy
} from 'react-icons/fi'

interface TiptapEditorProps {
  content: string
  onUpdate?: (content: string) => void
  editable?: boolean
}

const TiptapEditor = ({ content, onUpdate, editable = true }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  const handleCopy = async () => {
    try {
      // Obtener el contenido HTML del editor
      const htmlContent = editor.getHTML()
      
      // Crear un objeto con HTML y texto plano para mejor compatibilidad
      const clipboardData = {
        'text/html': htmlContent,
        'text/plain': editor.getText()
      }
      
      // Usar la nueva API del portapapeles si está disponible
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItems = []
        
        // Agregar HTML
        clipboardItems.push(
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([editor.getText()], { type: 'text/plain' })
          })
        )
        
        await navigator.clipboard.write(clipboardItems)
      } else {
        // Fallback: copiar solo HTML (Word puede interpretarlo)
        await navigator.clipboard.writeText(htmlContent)
      }
      
      toast.success('Contenido copiado con formato para Word')
    } catch (error) {
      console.error('Error al copiar:', error)
      // Fallback: copiar texto plano
      try {
        await navigator.clipboard.writeText(editor.getText())
        toast.success('Contenido copiado como texto plano')
      } catch (fallbackError) {
        toast.error('Error al copiar el contenido')
      }
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden h-full flex flex-col">
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <FiBold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <FiItalic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          >
            H2
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          >
            H3
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <FiList className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
          >
            <FiCode className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Copiar contenido"
          >
            <FiCopy className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className={`prose prose-sm max-w-none p-4 min-h-[400px] ${
            editable ? 'cursor-text' : ''
          }`}
        />
      </div>
    </div>
  )
}

export default TiptapEditor

