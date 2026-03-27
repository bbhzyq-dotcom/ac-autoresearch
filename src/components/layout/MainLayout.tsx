import React from 'react';
import { Settings, FolderOpen } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
  isConfigured: boolean;
}

export function MainLayout({ 
  children, 
  onOpenSettings, 
  onOpenProjects,
  isConfigured 
}: MainLayoutProps) {
  const { preferences } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Academic Research Web</h1>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              v0.1.0
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProjects}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Projects"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConfigured ? 'Ready' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Academic Research Skills v2.9</span>
          <span>{preferences.citationFormat} Citation Format</span>
        </div>
      </footer>
    </div>
  );
}
