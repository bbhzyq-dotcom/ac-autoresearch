import React from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import type { Project } from '@/types';

interface ProjectListProps {
  onClose: () => void;
}

export function ProjectList({ onClose }: ProjectListProps) {
  const { projects, setCurrentProject, deleteProject } = useAppStore();

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    onClose();
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleNewProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: 'New Research Project',
      topic: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentStage: 1,
      stageStatus: 'idle',
      materials: [],
      settings: {
        language: 'en',
        citationFormat: 'APA7',
        paperType: 'IMRaD',
        wordCountTarget: 8000,
      },
    };
    
    useAppStore.getState().addProject(newProject);
    setCurrentProject(newProject);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStageName = (stage: number) => {
    const stageNames: Record<number, string> = {
      1: 'Research',
      2: 'Writing',
      2.5: 'Integrity Check',
      3: 'Review',
      4: 'Revision',
      3.5: 'Re-Review',
      4.5: 'Final Integrity',
      5: 'Finalize',
      6: 'Process Summary',
    };
    return stageNames[stage] || `Stage ${stage}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Projects</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.topic || 'No topic set'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.updatedAt)}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {getStageName(project.currentStage)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
