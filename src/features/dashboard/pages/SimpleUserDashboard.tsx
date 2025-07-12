import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit3, Copy, Trash2, Search, Grid, List } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

interface SimpleProject {
  id: string;
  title: string;
  content: string;
  platform: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isFavorite?: boolean;
  formData: {
    platform: string;
    duration: string;
  };
}

const SimpleUserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<SimpleProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadProjects = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const q = query(
        collection(db, 'roteiros'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SimpleProject[];

      setProjects(userProjects);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      setError('Falha ao carregar projetos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, loadProjects]);

  useEffect(() => {
    // Filtrar projetos baseado na busca
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.platform.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm]);

  const handleEdit = (project: SimpleProject) => {
    navigate('/generator', { 
      state: { 
        editMode: true, 
        scriptData: project 
      } 
    });
  };

  const handleDuplicate = async (project: SimpleProject) => {
    try {
      navigate('/generator', { 
        state: { 
          duplicateMode: true, 
          scriptData: { 
            ...project,
            title: `${project.title} (Cópia)`,
            id: undefined // Remove ID para criar novo
          }
        } 
      });
    } catch (err) {
      console.error('Erro ao duplicar projeto:', err);
      alert('Erro ao duplicar projeto.');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'roteiros', projectId));
      await loadProjects(); // Recarregar lista
      alert('Projeto excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      alert('Erro ao excluir projeto.');
    }
  };

  const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'Data inválida';
    
    try {
      // Se é um Timestamp do Firebase
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('pt-BR');
      }
      
      // Se é uma Date regular
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('pt-BR');
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <Button onClick={loadProjects}>Tentar Novamente</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Roteiros</h1>
          <p className="text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title={`Alternar para visualização em ${viewMode === 'grid' ? 'lista' : 'grade'}`}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => navigate('/generator')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Roteiro
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar roteiros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum roteiro ainda'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente alterar os termos de busca' 
              : 'Comece criando seu primeiro roteiro!'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/generator')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Roteiro
            </Button>
          )}
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }>
          {filteredProjects.map((project) => (
            <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {project.title || 'Sem título'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.platform || 'Plataforma'}
                      </Badge>
                      {project.isFavorite && (
                        <Badge variant="secondary" className="text-xs">
                          ⭐ Favorito
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {project.content?.substring(0, 120)}...
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(project.updatedAt || project.createdAt)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(project)}
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleUserDashboard; 