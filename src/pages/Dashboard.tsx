import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCard } from '@/components/common/ProjectCard';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';

export const Dashboard: React.FC = () => {
  const { projects, createProject } = useProjects();
  const { user } = useAuth();
  const badgeContext = useBadgeContextOptional();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title.trim()) {
      createProject(newProject.title, newProject.description);
      setNewProject({ title: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  // Calculate real-time project metrics
  const activeProjects = projects.filter(p => p.progress < 100);
  const lastModifiedProject = projects.length > 0 
    ? projects.reduce((latest, current) => 
        current.lastModified > latest.lastModified ? current : latest
      )
    : null;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 max-w-none">
        {/* Welcome Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center px-2"
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Pronto para continuar sua jornada de aprendizagem?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          <Card className="interactive-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium">Última Modificação</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl font-bold break-words">
                {lastModifiedProject ? lastModifiedProject.title : 'Nenhum projeto'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastModifiedProject ? new Date(lastModifiedProject.lastModified).toLocaleDateString('pt-BR') : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="interactive-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium">Experiência (XP)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{badgeContext?.totalXP ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Nível {badgeContext?.level ?? 1}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Projetos Ativos</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie e acompanhe seus projetos CBL em andamento
              </p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="sm:hidden">Novo</span>
                  <span className="hidden sm:inline">Novo Projeto</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Inicie um novo projeto de Aprendizagem Baseada em Desafios
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Projeto</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Redução do desperdício alimentar na escola"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva brevemente o objetivo e contexto do projeto..."
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="gradient-primary text-white">
                      Criar Projeto
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Projects Grid */}
          {activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="mx-auto max-w-md">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum projeto ativo</h3>
                <p className="text-muted-foreground mb-6">
                  {projects.length > 0 ? 'Todos os projetos foram concluídos!' : 'Crie seu primeiro projeto CBL e comece sua jornada de aprendizagem'}
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gradient-primary text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {projects.length > 0 ? 'Criar Novo Projeto' : 'Criar Primeiro Projeto'}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};