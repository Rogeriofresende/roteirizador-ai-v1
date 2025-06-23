import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { SavedScript } from '../types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, Eye, FileText, Calendar } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Clock } from 'lucide-react';

const UserDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'scripts'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userScripts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedScript[];
        setScripts(userScripts);
      } catch (err) {
        setError('Falha ao carregar roteiros.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchScripts();
  }, [currentUser]);

  const handleDelete = async (scriptId: string) => {
    if(!window.confirm("Tem certeza que deseja apagar este roteiro?")) return;
    try {
        await deleteDoc(doc(db, "scripts", scriptId));
        setScripts(scripts.filter(script => script.id !== scriptId));
    } catch(err) {
        setError("Falha ao apagar o roteiro.");
        console.error(err);
    }
  }

  const toggleExpandScript = (scriptId: string) => {
    if (expandedScript === scriptId) {
      setExpandedScript(null);
    } else {
      setExpandedScript(scriptId);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data desconhecida';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Meus Roteiros</h1>
        <Card className="bg-background/60 backdrop-blur-sm border-border/50">
          <div className="p-6">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Meus Roteiros</h1>
        <Card className="bg-background/60 backdrop-blur-sm border-border/50">
          <div className="p-6 text-center text-red-500">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Meus Roteiros</h1>
        
        <Card className="bg-background/60 backdrop-blur-sm border-border/50 overflow-hidden relative">
          {scripts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-foreground">Você ainda não salvou nenhum roteiro.</p>
              <p className="text-muted-foreground mt-2">Crie seu primeiro roteiro para vê-lo aqui.</p>
            </div>
          ) : (
            <div className="p-4 relative z-10">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Assunto</TableHead>
                      <TableHead className="w-[15%]">Data de Criação</TableHead>
                      <TableHead className="w-[15%]">Detalhes</TableHead>
                      <TableHead className="w-[10%]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scripts.map((script) => (
                      <React.Fragment key={script.id}>
                        <TableRow className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">
                            {script.formData.subject}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(script.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{script.formData.duration || 'N/A'}s</span>
                              </Badge>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{getWordCount(script.scriptContent)} palavras</span>
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpandScript(script.id)}
                                title="Visualizar roteiro"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(script.id)}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                title="Apagar roteiro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {expandedScript === script.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0">
                              <div className="bg-muted/30 p-4 rounded-md m-2">
                                <pre className="whitespace-pre-wrap font-sans text-base text-foreground">
                                  {script.scriptContent}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardPage; 