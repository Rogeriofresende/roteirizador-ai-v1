/**
 * 🎯 SPEC VALIDATION UI
 * 
 * Interface para validação de especificações em linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Beta - Solution Architect + Frontend
 * @created 2025-07-18T15:10:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ValidationResult, 
  ValidationIssue, 
  NaturalLanguageSpecification 
} from '../types/naturalLanguageTypes';
import { naturalLanguageSpecService } from '../services/naturalLanguageSpecService';

// 🎯 PROPS INTERFACE
interface SpecValidationUIProps {
  spec: NaturalLanguageSpecification;
  onValidationComplete?: (result: ValidationResult) => void;
  onFixIssue?: (issue: ValidationIssue) => void;
  autoValidate?: boolean;
  showDetails?: boolean;
}

// 🎨 COMPONENT PRINCIPAL
export const SpecValidationUI: React.FC<SpecValidationUIProps> = ({
  spec,
  onValidationComplete,
  onFixIssue,
  autoValidate = true,
  showDetails = true
}) => {
  // 📊 STATE MANAGEMENT
  const [validation, setValidation] = useState<ValidationResult | null>(spec.validation);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 🔄 EFFECTS
  useEffect(() => {
    if (autoValidate) {
      validateSpec();
    }
  }, [spec, autoValidate]);

  useEffect(() => {
    if (validation && onValidationComplete) {
      onValidationComplete(validation);
    }
  }, [validation, onValidationComplete]);

  // ✅ VALIDATE SPECIFICATION
  const validateSpec = async () => {
    setIsValidating(true);
    try {
      const result = await naturalLanguageSpecService.validateSpecification(spec.id);
      setValidation(result);
    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // 🔄 TOGGLE SECTION EXPANSION
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // 🎨 RENDER LOADING STATE
  if (isValidating) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Validando especificação...</span>
        </div>
      </div>
    );
  }

  // 🎨 RENDER EMPTY STATE
  if (!validation) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Nenhuma validação disponível</p>
          <button
            onClick={validateSpec}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Validar Especificação
          </button>
        </div>
      </div>
    );
  }

  // 🎯 VALIDATION SCORE COLOR
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 🎯 VALIDATION SCORE BACKGROUND
  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // 🎯 ISSUE TYPE ICON
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      default: return 'ℹ️';
    }
  };

  // 🎯 ISSUE TYPE STYLING
  const getIssueStyles = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // 🎯 RENDER MAIN COMPONENT
  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📊 Validação da Especificação
          </h3>
          <button
            onClick={validateSpec}
            disabled={isValidating}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            🔄 Revalidar
          </button>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg mb-4 ${getScoreBackground(validation.score)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${getScoreColor(validation.score)}`}>
                {validation.isValid ? '✅' : '❌'}
              </div>
              <div>
                <h4 className={`font-semibold ${getScoreColor(validation.score)}`}>
                  {validation.isValid ? 'Especificação Válida' : 'Especificação Inválida'}
                </h4>
                <p className="text-sm text-gray-600">
                  Score geral: {Math.round(validation.score * 100)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Última validação: {validation.lastValidated.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Completude</span>
              <span className={`text-sm font-semibold ${getScoreColor(validation.completeness)}`}>
                {Math.round(validation.completeness * 100)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  validation.completeness >= 0.8 ? 'bg-green-500' :
                  validation.completeness >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${validation.completeness * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Clareza</span>
              <span className={`text-sm font-semibold ${getScoreColor(validation.clarity)}`}>
                {Math.round(validation.clarity * 100)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  validation.clarity >= 0.8 ? 'bg-green-500' :
                  validation.clarity >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${validation.clarity * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Testabilidade</span>
              <span className={`text-sm font-semibold ${getScoreColor(validation.testability)}`}>
                {Math.round(validation.testability * 100)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  validation.testability >= 0.8 ? 'bg-green-500' :
                  validation.testability >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${validation.testability * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>
            <span className="font-medium text-red-600">
              {validation.issues.filter(i => i.type === 'error').length}
            </span> erros
          </span>
          <span>
            <span className="font-medium text-yellow-600">
              {validation.issues.filter(i => i.type === 'warning').length}
            </span> avisos
          </span>
          <span>
            <span className="font-medium text-blue-600">
              {validation.issues.filter(i => i.type === 'suggestion').length}
            </span> sugestões
          </span>
        </div>
      </div>

      {/* Issues List */}
      {validation.issues.length > 0 && showDetails && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            🚨 Problemas Identificados
          </h4>
          
          <div className="space-y-3">
            {validation.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getIssueStyles(issue.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getIssueIcon(issue.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm uppercase tracking-wide">
                          {issue.section}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {issue.message}
                      </p>
                      {issue.fixable && (
                        <button
                          onClick={() => onFixIssue && onFixIssue(issue)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          🔧 Corrigir automaticamente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && showDetails && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Sugestões de Melhoria
          </h4>
          
          <div className="space-y-3">
            {validation.suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
              >
                <div className="text-blue-600">💡</div>
                <p className="text-sm text-blue-800">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Validation History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            📈 Histórico de Validação
          </h4>
          <button
            onClick={() => toggleSection('history')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {expandedSections.has('history') ? '▼' : '▶'} Detalhes
          </button>
        </div>

        <AnimatePresence>
          {expandedSections.has('history') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Primeira validação:</span>
                    <span className="font-medium">
                      {validation.lastValidated.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de validações:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Melhor score:</span>
                    <span className={`font-medium ${getScoreColor(validation.score)}`}>
                      {Math.round(validation.score * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Dicas para Melhorar a Validação
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">📋 Completude</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Preencha todas as seções obrigatórias</li>
              <li>• Adicione exemplos específicos</li>
              <li>• Detalhe critérios de aceitação</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-800 mb-2">🔍 Clareza</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Use linguagem simples e direta</li>
              <li>• Evite ambiguidades</li>
              <li>• Forneça contexto suficiente</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-800 mb-2">🧪 Testabilidade</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Defina comportamentos mensuráveis</li>
              <li>• Especifique critérios de sucesso</li>
              <li>• Inclua casos de teste</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-800 mb-2">⚡ Melhores Práticas</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Valide frequentemente</li>
              <li>• Corrija problemas rapidamente</li>
              <li>• Mantenha especificações atualizadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecValidationUI;