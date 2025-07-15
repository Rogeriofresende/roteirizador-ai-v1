/**
 * 🧠 BANCO DE IDEIAS - STATE HOOK V8.0
 * State management extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import { useState, useCallback } from 'react';
import { BancoDeIdeiasState, TabType, AlertType, IdeaFormData, IdeaResponse } from '../types';
import { DEFAULT_FORM_DATA } from '../constants';

export const useBancoDeIdeiasState = () => {
  // ============================================================================
  // MAIN STATE
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [formData, setFormData] = useState<IdeaFormData>(DEFAULT_FORM_DATA);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ============================================================================
  // MODAL STATES
  // ============================================================================
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [showImplementationModal, setShowImplementationModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  
  // ============================================================================
  // EDITING STATES
  // ============================================================================
  
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [editedIdea, setEditedIdea] = useState<IdeaResponse | null>(null);
  
  // ============================================================================
  // SHARING STATES
  // ============================================================================
  
  const [selectedIdeaForShare, setSelectedIdeaForShare] = useState<IdeaResponse | null>(null);
  const [shareItem, setShareItem] = useState<any>(null);
  
  // ============================================================================
  // ALERT SYSTEM
  // ============================================================================
  
  const [alerts, setAlerts] = useState<Array<{ type: AlertType; message: string }>>([]);
  
  // ============================================================================
  // LOADING STATES
  // ============================================================================
  
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // ============================================================================
  // STATE ACTIONS
  // ============================================================================
  
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);
  
  const handleFormChange = useCallback(<K extends keyof IdeaFormData>(
    field: K,
    value: IdeaFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const addAlert = useCallback((type: AlertType, message: string) => {
    const newAlert = { type, message };
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-remove alert after 3 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert !== newAlert));
    }, 3000);
  }, []);
  
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);
  
  // ============================================================================
  // MODAL ACTIONS
  // ============================================================================
  
  const openModal = useCallback((modalType: keyof BancoDeIdeiasState['showModals']) => {
    switch (modalType) {
      case 'upgrade':
        setShowUpgradeModal(true);
        break;
      case 'personalization':
        setShowPersonalizationModal(true);
        break;
      case 'implementation':
        setShowImplementationModal(true);
        break;
      case 'quickAdd':
        setShowQuickAddModal(true);
        break;
      case 'share':
        setShowShareModal(true);
        break;
      case 'collaboration':
        setShowCollaborationPanel(true);
        break;
    }
  }, []);
  
  const closeModal = useCallback((modalType: keyof BancoDeIdeiasState['showModals']) => {
    switch (modalType) {
      case 'upgrade':
        setShowUpgradeModal(false);
        break;
      case 'personalization':
        setShowPersonalizationModal(false);
        break;
      case 'implementation':
        setShowImplementationModal(false);
        break;
      case 'quickAdd':
        setShowQuickAddModal(false);
        break;
      case 'share':
        setShowShareModal(false);
        setSelectedIdeaForShare(null);
        break;
      case 'collaboration':
        setShowCollaborationPanel(false);
        break;
    }
  }, []);
  
  const closeAllModals = useCallback(() => {
    setShowUpgradeModal(false);
    setShowPersonalizationModal(false);
    setShowImplementationModal(false);
    setShowQuickAddModal(false);
    setShowShareModal(false);
    setShowCollaborationPanel(false);
    setSelectedIdeaForShare(null);
  }, []);
  
  // ============================================================================
  // IDEA ACTIONS
  // ============================================================================
  
  const startIdeaGeneration = useCallback(() => {
    setIsGenerating(true);
    setGenerationProgress(0);
  }, []);
  
  const finishIdeaGeneration = useCallback((idea: IdeaResponse | null) => {
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentIdea(idea);
  }, []);
  
  const updateGenerationProgress = useCallback((progress: number) => {
    setGenerationProgress(Math.min(Math.max(progress, 0), 100));
  }, []);
  
  // ============================================================================
  // EDITING ACTIONS
  // ============================================================================
  
  const startEditingIdea = useCallback((idea: IdeaResponse) => {
    setEditedIdea({ ...idea });
    setIsEditingIdea(true);
  }, []);
  
  const cancelEditingIdea = useCallback(() => {
    setIsEditingIdea(false);
    setEditedIdea(null);
  }, []);
  
  const updateEditedIdea = useCallback(<K extends keyof IdeaResponse>(
    field: K,
    value: IdeaResponse[K]
  ) => {
    if (editedIdea) {
      setEditedIdea(prev => prev ? { ...prev, [field]: value } : null);
    }
  }, [editedIdea]);
  
  // ============================================================================
  // SHARING ACTIONS
  // ============================================================================
  
  const selectIdeaForShare = useCallback((idea: IdeaResponse) => {
    setSelectedIdeaForShare(idea);
    setShowShareModal(true);
  }, []);
  
  // ============================================================================
  // RETURN STATE AND ACTIONS
  // ============================================================================
  
  return {
    // State
    state: {
      activeTab,
      formData,
      currentIdea,
      isGenerating,
      showModals: {
        upgrade: showUpgradeModal,
        personalization: showPersonalizationModal,
        implementation: showImplementationModal,
        quickAdd: showQuickAddModal,
        share: showShareModal,
        collaboration: showCollaborationPanel,
      },
      alerts,
      isEditingIdea,
      editedIdea,
      selectedIdeaForShare,
      shareItem,
      generationProgress,
    } as BancoDeIdeiasState & {
      isEditingIdea: boolean;
      editedIdea: IdeaResponse | null;
      selectedIdeaForShare: IdeaResponse | null;
      shareItem: any;
      generationProgress: number;
    },
    
    // Actions
    actions: {
      // Tab actions
      handleTabChange,
      
      // Form actions
      handleFormChange,
      
      // Alert actions
      addAlert,
      clearAlerts,
      
      // Modal actions
      openModal,
      closeModal,
      closeAllModals,
      
      // Idea actions
      startIdeaGeneration,
      finishIdeaGeneration,
      updateGenerationProgress,
      
      // Editing actions
      startEditingIdea,
      cancelEditingIdea,
      updateEditedIdea,
      
      // Sharing actions
      selectIdeaForShare,
      
      // Direct setters (for special cases)
      setCurrentIdea,
      setFormData,
    }
  };
}; 