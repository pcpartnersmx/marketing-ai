import { PromptProject } from '@/components/Dashboard';

const API_BASE_URL = '/api/projects';

export class ProjectsAPI {
  // Obtener todos los proyectos del usuario
  static async getProjects(): Promise<PromptProject[]> {
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    return response.json();
  }

  // Obtener un proyecto específico
  static async getProject(id: string): Promise<PromptProject> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener el proyecto');
    }
    
    return response.json();
  }

  // Crear un nuevo proyecto
  static async createProject(projectData: {
    name: string;
    description: string;
    tags?: string[];
    availableVariables?: string[];
  }): Promise<PromptProject> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el proyecto');
    }
    
    return response.json();
  }

  // Actualizar un proyecto
  static async updateProject(
    id: string, 
    projectData: Partial<Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PromptProject> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el proyecto');
    }
    
    return response.json();
  }

  // Eliminar un proyecto
  static async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el proyecto');
    }
  }

  // Generar prompt para un proyecto
  static async generatePrompt(
    id: string, 
    formData: { [key: string]: string }
  ): Promise<{ generatedPrompt: string }> {
    const response = await fetch(`${API_BASE_URL}/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData }),
    });
    
    if (!response.ok) {
      throw new Error('Error al generar el prompt');
    }
    
    return response.json();
  }

  // Generar respuesta de IA
  static async generateAIResponse(prompt: string): Promise<{ aiResponse: string }> {
    const response = await fetch('/api/openAi/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Error al generar la respuesta de IA');
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
      }
    }
    
    return { aiResponse: fullResponse };
  }

  // Generar respuesta de IA con streaming
  static async generateAIResponseStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/openAi/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar la respuesta de IA');
      }

      // Handle streaming text response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
      }
      
      onComplete();
    } catch (error) {
      console.error('Error:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
}
