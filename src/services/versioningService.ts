import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { 
  ScriptVersion,
  VersionChange,
  ComparisonData,
  DiffResult,
  AIImprovement
} from '../types';

export class VersioningService {
  private static readonly MAX_VERSIONS_PER_PROJECT = 50;
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 segundos

  // **GESTÃO DE VERSÕES**

  static async createVersion(
    projectId: string,
    userId: string,
    content: string,
    comment = '',
    isAutoSave = false,
    appliedSuggestions: string[] = []
  ): Promise<ScriptVersion> {
    try {
      // Obter número da próxima versão
      const versionNumber = await this.getNextVersionNumber(projectId);

      // Calcular metadata do conteúdo
      const metadata = this.calculateContentMetadata(content);

      // Detectar mudanças em relação à versão anterior
      const changes = await this.detectChanges(projectId, content);

      const version: ScriptVersion = {
        id: `version_${projectId}_${versionNumber}_${Date.now()}`,
        projectId,
        userId,
        versionNumber,
        content,
        changes,
        metadata,
        aiSuggestions: appliedSuggestions,
        comment,
        isAutoSave,
        timestamp: Timestamp.now(),
        stats: {
          improvementsApplied: appliedSuggestions.length,
          aiSuggestionsUsed: appliedSuggestions.length,
          manualEdits: changes.filter(c => c.type !== 'ai_suggestion').length
        }
      };

      // Salvar versão
      await setDoc(doc(db, 'script_versions', version.id), version);

      // Limpar versões antigas se necessário
      await this.cleanupOldVersions(projectId);

      // Atualizar projeto com a versão atual
      await this.updateProjectCurrentVersion(projectId, version.id);

      return version;

    } catch (error) {
      console.error('Erro ao criar versão:', error);
      throw new Error(`Falha ao criar versão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async getProjectVersions(
    projectId: string, 
    limit = 20
  ): Promise<ScriptVersion[]> {
    try {
      const versionsQuery = query(
        collection(db, 'script_versions'),
        where('projectId', '==', projectId),
        orderBy('versionNumber', 'desc'),
        limit(limit)
      );

      const versionsSnapshot = await getDocs(versionsQuery);
      return versionsSnapshot.docs.map(doc => doc.data() as ScriptVersion);

    } catch (error) {
      console.error('Erro ao obter versões:', error);
      return [];
    }
  }

  static async getVersion(versionId: string): Promise<ScriptVersion | null> {
    try {
      const versionDoc = await getDoc(doc(db, 'script_versions', versionId));
      return versionDoc.exists() ? versionDoc.data() as ScriptVersion : null;
    } catch (error) {
      console.error('Erro ao obter versão:', error);
      return null;
    }
  }

  static async getCurrentVersion(projectId: string): Promise<ScriptVersion | null> {
    try {
      const versionsQuery = query(
        collection(db, 'script_versions'),
        where('projectId', '==', projectId),
        orderBy('versionNumber', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(versionsQuery);
      if (snapshot.empty) return null;

      return snapshot.docs[0].data() as ScriptVersion;
    } catch (error) {
      console.error('Erro ao obter versão atual:', error);
      return null;
    }
  }

  static async restoreVersion(versionId: string, userId: string): Promise<ScriptVersion> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Versão não encontrada');
      }

      // Criar nova versão baseada na versão restaurada
      const restoredVersion = await this.createVersion(
        version.projectId,
        userId,
        version.content,
        `Restaurado da versão ${version.versionNumber}`,
        false
      );

      return restoredVersion;
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      throw error;
    }
  }

  // **COMPARAÇÃO DE VERSÕES**

  static async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<ComparisonData> {
    try {
      const [version1, version2] = await Promise.all([
        this.getVersion(version1Id),
        this.getVersion(version2Id)
      ]);

      if (!version1 || !version2) {
        throw new Error('Uma ou ambas as versões não foram encontradas');
      }

      if (version1.projectId !== version2.projectId) {
        throw new Error('As versões pertencem a projetos diferentes');
      }

      // Calcular diferenças
      const diff = this.calculateDiff(version1.content, version2.content);

      // Calcular métricas
      const metrics = this.calculateComparisonMetrics(diff, version1, version2);

      const comparison: ComparisonData = {
        id: `comparison_${version1Id}_${version2Id}_${Date.now()}`,
        projectId: version1.projectId,
        version1,
        version2,
        diff,
        metrics,
        timestamp: Timestamp.now()
      };

      // Salvar comparação para histórico
      await setDoc(doc(db, 'version_comparisons', comparison.id), comparison);

      return comparison;

    } catch (error) {
      console.error('Erro ao comparar versões:', error);
      throw error;
    }
  }

  static async getVersionComparisons(projectId: string): Promise<ComparisonData[]> {
    try {
      const comparisonsQuery = query(
        collection(db, 'version_comparisons'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(comparisonsQuery);
      return snapshot.docs.map(doc => doc.data() as ComparisonData);
    } catch (error) {
      console.error('Erro ao obter comparações:', error);
      return [];
    }
  }

  // **DIFF E ANÁLISE**

  private static calculateDiff(text1: string, text2: string): DiffResult[] {
    // Implementação simplificada de diff - em produção usaria biblioteca como diff-match-patch
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const diff: DiffResult[] = [];

    let i = 0;
    let j = 0;
    let position = 0;

    while (i < lines1.length || j < lines2.length) {
      const line1 = lines1[i];
      const line2 = lines2[j];

      if (i >= lines1.length) {
        // Linha adicionada
        diff.push({
          type: 'added',
          content: line2,
          startIndex: position,
          endIndex: position + line2.length
        });
        position += line2.length + 1;
        j++;
      } else if (j >= lines2.length) {
        // Linha removida
        diff.push({
          type: 'removed',
          content: line1,
          startIndex: position,
          endIndex: position + line1.length
        });
        i++;
      } else if (line1 === line2) {
        // Linha inalterada
        diff.push({
          type: 'unchanged',
          content: line1,
          startIndex: position,
          endIndex: position + line1.length
        });
        position += line1.length + 1;
        i++;
        j++;
      } else {
        // Linha modificada
        diff.push({
          type: 'modified',
          content: line2,
          startIndex: position,
          endIndex: position + line2.length
        });
        position += line2.length + 1;
        i++;
        j++;
      }
    }

    return diff;
  }

  private static calculateComparisonMetrics(
    diff: DiffResult[],
    version1: ScriptVersion,
    version2: ScriptVersion
  ): ComparisonData['metrics'] {
    const totalChanges = diff.filter(d => d.type !== 'unchanged').length;
    const addedWords = diff
      .filter(d => d.type === 'added')
      .reduce((sum, d) => sum + d.content.split(/\s+/).length, 0);
    const removedWords = diff
      .filter(d => d.type === 'removed')
      .reduce((sum, d) => sum + d.content.split(/\s+/).length, 0);
    const modifiedWords = diff
      .filter(d => d.type === 'modified')
      .reduce((sum, d) => sum + d.content.split(/\s+/).length, 0);

    // Calcular score de melhoria baseado nas métricas das versões
    const improvementScore = this.calculateImprovementScore(version1, version2);

    return {
      totalChanges,
      addedWords,
      removedWords,
      modifiedWords,
      improvementScore
    };
  }

  private static calculateImprovementScore(
    version1: ScriptVersion,
    version2: ScriptVersion
  ): number {
    // Score baseado em mudanças nos metadados
    let score = 50; // Base neutra

    // Melhorias na contagem de palavras (mais conciso = melhor para alguns casos)
    const wordDiff = version2.metadata.wordCount - version1.metadata.wordCount;
    if (Math.abs(wordDiff) < version1.metadata.wordCount * 0.1) {
      score += 10; // Mudança apropriada
    }

    // Melhorias no sentimento
    if (version2.metadata.sentiment > version1.metadata.sentiment) {
      score += 15;
    }

    // Uso de sugestões de IA
    if (version2.aiSuggestions.length > 0) {
      score += 20;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  // **METADATA E ANÁLISE**

  private static calculateContentMetadata(content: string): ScriptVersion['metadata'] {
    const words = content.split(/\s+/).filter(Boolean);
    const characters = content.length;
    const readingTime = Math.ceil(words.length / 150); // 150 palavras por minuto
    
    // Análise básica de sentimento (seria melhorada com IA)
    const sentiment = this.basicSentimentAnalysis(content);
    
    // Densidade de palavras-chave
    const keywordDensity = this.calculateKeywordDensity(content);

    return {
      wordCount: words.length,
      characterCount: characters,
      readingTime,
      sentiment,
      keywordDensity
    };
  }

  private static basicSentimentAnalysis(text: string): number {
    // Implementação básica - em produção usaria serviço de IA
    const positiveWords = ['bom', 'ótimo', 'excelente', 'incrível', 'fantástico', 'amor', 'feliz'];
    const negativeWords = ['ruim', 'terrível', 'péssimo', 'ódio', 'triste', 'problema'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    if (positiveCount + negativeCount === 0) return 0;
    return (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }

  private static calculateKeywordDensity(text: string): Record<string, number> {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: Record<string, number> = {};
    const totalWords = words.length;

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Converter para densidade percentual e manter apenas as mais relevantes
    const density: Record<string, number> = {};
    Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([word, count]) => {
        density[word] = Math.round((count / totalWords) * 100);
      });

    return density;
  }

  // **DETECÇÃO DE MUDANÇAS**

  private static async detectChanges(
    projectId: string,
    newContent: string
  ): Promise<VersionChange[]> {
    try {
      const currentVersion = await this.getCurrentVersion(projectId);
      if (!currentVersion) {
        return []; // Primeira versão, sem mudanças
      }

      const changes: VersionChange[] = [];
      const oldContent = currentVersion.content;

      // Detectar mudanças usando diff simples
      const diff = this.calculateDiff(oldContent, newContent);
      
      diff.forEach((diffItem, index) => {
        if (diffItem.type !== 'unchanged') {
          changes.push({
            id: `change_${Date.now()}_${index}`,
            type: diffItem.type === 'added' ? 'addition' : 
                  diffItem.type === 'removed' ? 'deletion' : 'modification',
            startIndex: diffItem.startIndex,
            endIndex: diffItem.endIndex,
            oldText: diffItem.type === 'added' ? '' : diffItem.content,
            newText: diffItem.type === 'removed' ? '' : diffItem.content,
            timestamp: Timestamp.now()
          });
        }
      });

      return changes;
    } catch (error) {
      console.error('Erro ao detectar mudanças:', error);
      return [];
    }
  }

  // **UTILITÁRIOS**

  private static async getNextVersionNumber(projectId: string): Promise<number> {
    try {
      const versions = await this.getProjectVersions(projectId, 1);
      return versions.length > 0 ? versions[0].versionNumber + 1 : 1;
    } catch (error) {
      console.error('Erro ao obter próximo número de versão:', error);
      return 1;
    }
  }

  private static async cleanupOldVersions(projectId: string): Promise<void> {
    try {
      const versions = await this.getProjectVersions(projectId, 100);
      
      if (versions.length <= this.MAX_VERSIONS_PER_PROJECT) {
        return;
      }

      // Manter as versões mais recentes e algumas importantes
      const versionsToKeep = versions
        .slice(0, this.MAX_VERSIONS_PER_PROJECT - 10) // Manter as 40 mais recentes
        .concat(
          versions.filter(v => !v.isAutoSave) // Manter todas as versões manuais
        );

      const versionsToDelete = versions.filter(v => 
        !versionsToKeep.some(keep => keep.id === v.id)
      );

      // Deletar versões antigas
      await Promise.all(
        versionsToDelete.map(version => 
          deleteDoc(doc(db, 'script_versions', version.id))
        )
      );

    } catch (error) {
      console.error('Erro na limpeza de versões antigas:', error);
    }
  }

  private static async updateProjectCurrentVersion(
    projectId: string, 
    versionId: string
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'scripts', projectId);
      await updateDoc(projectRef, { 
        currentVersionId: versionId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar versão atual do projeto:', error);
    }
  }

  // **AUTO-SAVE**

  static async enableAutoSave(
    projectId: string,
    userId: string,
    getContent: () => string
  ): Promise<() => void> {
    let lastContent = getContent();
    let lastSave = Date.now();

    const interval = setInterval(async () => {
      try {
        const currentContent = getContent();
        const now = Date.now();

        // Verificar se houve mudanças e se passou tempo suficiente
        if (currentContent !== lastContent && 
            now - lastSave >= this.AUTO_SAVE_INTERVAL) {
          
          await this.createVersion(
            projectId,
            userId,
            currentContent,
            'Auto-save',
            true
          );

          lastContent = currentContent;
          lastSave = now;
        }
      } catch (error) {
        console.error('Erro no auto-save:', error);
      }
    }, this.AUTO_SAVE_INTERVAL);

    // Retornar função para parar o auto-save
    return () => clearInterval(interval);
  }

  // **MELHORIAS E SUGESTÕES**

  static async applyAIImprovement(
    versionId: string,
    improvement: AIImprovement,
    userId: string
  ): Promise<ScriptVersion> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Versão não encontrada');
      }

      // Aplicar melhoria no conteúdo
      const newContent = version.content.substring(0, improvement.startIndex) +
                        improvement.improvedSegment +
                        version.content.substring(improvement.endIndex);

      // Criar nova versão com a melhoria aplicada
      const newVersion = await this.createVersion(
        version.projectId,
        userId,
        newContent,
        `Aplicada melhoria de IA: ${improvement.type}`,
        false,
        [improvement.id]
      );

      // Marcar melhoria como aceita
      const improvementRef = doc(db, 'ai_improvements', improvement.id);
      await updateDoc(improvementRef, { 
        accepted: true,
        acceptedAt: Timestamp.now(),
        versionId: newVersion.id
      });

      return newVersion;
    } catch (error) {
      console.error('Erro ao aplicar melhoria de IA:', error);
      throw error;
    }
  }

  // **EXPORTAÇÃO E BACKUP**

  static async exportVersionHistory(projectId: string): Promise<{
    project: any;
    versions: ScriptVersion[];
    comparisons: ComparisonData[];
  }> {
    try {
      const [versions, comparisons] = await Promise.all([
        this.getProjectVersions(projectId, 100),
        this.getVersionComparisons(projectId)
      ]);

      // Obter dados do projeto
      const projectDoc = await getDoc(doc(db, 'scripts', projectId));
      const project = projectDoc.exists() ? projectDoc.data() : null;

      return {
        project,
        versions,
        comparisons
      };
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
      throw error;
    }
  }

  static async createBackup(projectId: string): Promise<string> {
    try {
      const history = await this.exportVersionHistory(projectId);
      
      const backup = {
        timestamp: new Date().toISOString(),
        projectId,
        data: history
      };

      const backupRef = doc(collection(db, 'version_backups'));
      await setDoc(backupRef, backup);

      return backupRef.id;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }
} 