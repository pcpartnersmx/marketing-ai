# Form → Prompt Builder

Una aplicación web para crear prompts personalizados mediante formularios dinámicos y templates editables.

## Características

- **Formulario de Configuración**: Captura información básica (producto, público objetivo, objetivo, tono, restricciones)
- **Editor de Template**: Permite crear templates con variables usando la sintaxis `{variable}`
- **Generador de Prompts**: Reemplaza automáticamente las variables con los datos del formulario
- **Copia al Portapapeles**: Funcionalidad para copiar el prompt generado
- **Validación**: Campos requeridos con validación en tiempo real
- **UI Dark Mode**: Interfaz oscura y minimalista

## Tecnologías

- Next.js 15 con App Router
- TypeScript
- Tailwind CSS
- React Hooks

## Instalación

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso

1. **Formulario**: Completa los campos requeridos (producto, público objetivo, objetivo, tono)
2. **Template**: Edita el template usando las variables disponibles o crea uno personalizado
3. **Resultado**: Genera y copia el prompt final

## Variables Disponibles

- `{producto}` - Producto o servicio
- `{publicoObjetivo}` - Público objetivo
- `{objetivo}` - Objetivo del prompt
- `{tono}` - Tono de comunicación
- `{restricciones}` - Restricciones adicionales

## Estructura del Proyecto

```
src/
├── app/
│   └── page.tsx          # Página principal
├── components/
│   ├── FormComponent.tsx     # Formulario de configuración
│   ├── TemplateEditor.tsx    # Editor de templates
│   └── PromptDisplay.tsx     # Visualización y copia de prompts
```