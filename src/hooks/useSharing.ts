/**
 * USE SHARING HOOK - SPRINT 4
 * React hook for sharing functionality
 * V7.5 Enhanced - IA Beta Implementation
 */

import { useState, useEffect, useCallback } from 'react';
import SharingService, { 
  ShareableItem, 
  ShareLink, 
  ShareRequest, 
  ShareAnalytics,
  SharePermissions
} from '../services/sharing/SharingService';

interface UseSharingOptions {
  autoLoad?: boolean;
  enableAnalytics?: boolean;
}

interface SharingState {
  items: ShareableItem[];
  analytics: ShareAnalytics | null;
  isLoading: boolean;
  isSharing: boolean;
  isCreating: boolean;
  error: string | null;
  lastSharedLink: ShareLink | null;
}

export const useSharing = (options: UseSharingOptions = {}) => {
  const {
    autoLoad = true,
    enableAnalytics = true
  } = options;

  // Service instance
  const [service] = useState(() => new SharingService());

  // State
  const [state, setState] = useState<SharingState>({
    items: [],
    analytics: null,
    isLoading: false,
    isSharing: false,
    isCreating: false,
    error: null,
    lastSharedLink: null
  });

  /**
   * Load user's shared items
   */
  const loadUserItems = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const items = service.getUserSharedItems();
      const analytics = enableAnalytics ? service.getShareAnalytics() : null;

      setState(prev => ({
        ...prev,
        items,
        analytics,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load items'
      }));
    }
  }, [service, enableAnalytics]);

  /**
   * Create a new shareable item
   */
  const createShareableItem = useCallback(async (
    type: ShareableItem['type'],
    title: string,
    content: string,
    permissions?: SharePermissions
  ): Promise<ShareableItem | null> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      const item = await service.createShareableItem(type, title, content, permissions);
      
      setState(prev => ({
        ...prev,
        items: [item, ...prev.items],
        isCreating: false
      }));

      return item;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: error instanceof Error ? error.message : 'Failed to create item'
      }));
      return null;
    }
  }, [service]);

  /**
   * Generate share link for an item
   */
  const generateShareLink = useCallback(async (
    itemId: string,
    customPermissions?: Partial<SharePermissions>
  ): Promise<ShareLink | null> => {
    setState(prev => ({ ...prev, isSharing: true, error: null }));

    try {
      const shareLink = await service.generateShareLink(itemId, customPermissions);
      
      setState(prev => ({
        ...prev,
        lastSharedLink: shareLink,
        isSharing: false
      }));

      return shareLink;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSharing: false,
        error: error instanceof Error ? error.message : 'Failed to generate link'
      }));
      return null;
    }
  }, [service]);

  /**
   * Share item via specific platform
   */
  const shareItem = useCallback(async (request: ShareRequest): Promise<{
    success: boolean;
    shareLink?: ShareLink;
    message?: string;
  }> => {
    setState(prev => ({ ...prev, isSharing: true, error: null }));

    try {
      const result = await service.shareItem(request);
      
      setState(prev => ({
        ...prev,
        isSharing: false,
        lastSharedLink: result.shareLink || null,
        error: result.success ? null : result.message || 'Sharing failed'
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSharing: false,
        error: error instanceof Error ? error.message : 'Failed to share item'
      }));
      
      return { success: false, message: 'Failed to share item' };
    }
  }, [service]);

  /**
   * Quick share - create and share in one step
   */
  const quickShare = useCallback(async (
    type: ShareableItem['type'],
    title: string,
    content: string,
    platform: ShareRequest['platform'] = 'copy',
    permissions?: SharePermissions
  ): Promise<{ success: boolean; shareLink?: ShareLink; message?: string }> => {
    setState(prev => ({ ...prev, isCreating: true, isSharing: true, error: null }));

    try {
      // Create shareable item
      const item = await service.createShareableItem(type, title, content, permissions);
      
      // Share it
      const result = await service.shareItem({
        itemId: item.id,
        permissions: item.permissions,
        platform
      });

      setState(prev => ({
        ...prev,
        items: [item, ...prev.items],
        isCreating: false,
        isSharing: false,
        lastSharedLink: result.shareLink || null,
        error: result.success ? null : result.message || 'Quick share failed'
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        isSharing: false,
        error: error instanceof Error ? error.message : 'Failed to quick share'
      }));
      
      return { success: false, message: 'Failed to quick share' };
    }
  }, [service]);

  /**
   * Access shared item by link
   */
  const accessSharedItem = useCallback(async (
    linkId: string,
    password?: string
  ): Promise<ShareableItem | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const item = await service.accessSharedItem(linkId, password);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: item ? null : 'Item not found or access denied'
      }));

      return item;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to access item'
      }));
      return null;
    }
  }, [service]);

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = useCallback(async (shareLink: ShareLink): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareLink.shortUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  /**
   * Share via email
   */
  const shareViaEmail = useCallback(async (
    itemId: string,
    emails: string[],
    message?: string,
    permissions?: Partial<SharePermissions>
  ): Promise<{ success: boolean; shareLink?: ShareLink; message?: string }> => {
    return shareItem({
      itemId,
      recipientEmails: emails,
      message,
      platform: 'email',
      permissions: permissions || {}
    });
  }, [shareItem]);

  /**
   * Share via social media
   */
  const shareViaSocial = useCallback(async (
    itemId: string,
    platform: 'whatsapp' | 'telegram' | 'twitter' | 'linkedin',
    message?: string,
    permissions?: Partial<SharePermissions>
  ): Promise<{ success: boolean; shareLink?: ShareLink; message?: string }> => {
    return shareItem({
      itemId,
      message,
      platform,
      permissions: permissions || {}
    });
  }, [shareItem]);

  /**
   * Get item by ID
   */
  const getItemById = useCallback((itemId: string): ShareableItem | undefined => {
    return state.items.find(item => item.id === itemId);
  }, [state.items]);

  /**
   * Get items by type
   */
  const getItemsByType = useCallback((type: ShareableItem['type']): ShareableItem[] => {
    return state.items.filter(item => item.type === type);
  }, [state.items]);

  /**
   * Get trending items (most viewed)
   */
  const getTrendingItems = useCallback((limit: number = 10): ShareableItem[] => {
    return [...state.items]
      .sort((a, b) => b.metadata.views - a.metadata.views)
      .slice(0, limit);
  }, [state.items]);

  /**
   * Get recent items
   */
  const getRecentItems = useCallback((limit: number = 10): ShareableItem[] => {
    return [...state.items]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }, [state.items]);

  /**
   * Format share message for different platforms
   */
  const formatShareMessage = useCallback((
    item: ShareableItem,
    platform: ShareRequest['platform'],
    customMessage?: string
  ): string => {
    const baseMessage = customMessage || `Confira este conteúdo: ${item.title}`;
    
    switch (platform) {
      case 'whatsapp':
        return `${baseMessage}\n\n*${item.title}*`;
      case 'telegram':
        return `${baseMessage}\n\n**${item.title}**`;
      case 'twitter':
        return `${baseMessage} - ${item.title}`;
      case 'linkedin':
        return `${baseMessage}\n\n${item.title}`;
      case 'email':
        return `${baseMessage}\n\n${item.title}\n\n${item.content.substring(0, 200)}...`;
      default:
        return baseMessage;
    }
  }, []);

  /**
   * Update analytics
   */
  const updateAnalytics = useCallback(async (): Promise<void> => {
    if (!enableAnalytics) return;

    try {
      const analytics = service.getShareAnalytics();
      setState(prev => ({ ...prev, analytics }));
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }, [service, enableAnalytics]);

  /**
   * Load items on mount
   */
  useEffect(() => {
    if (autoLoad) {
      loadUserItems();
    }
  }, [autoLoad, loadUserItems]);

  /**
   * Periodic analytics update
   */
  useEffect(() => {
    if (enableAnalytics) {
      const interval = setInterval(updateAnalytics, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [enableAnalytics, updateAnalytics]);

  return {
    // State
    items: state.items,
    analytics: state.analytics,
    isLoading: state.isLoading,
    isSharing: state.isSharing,
    isCreating: state.isCreating,
    error: state.error,
    lastSharedLink: state.lastSharedLink,
    
    // Actions
    loadUserItems,
    createShareableItem,
    generateShareLink,
    shareItem,
    quickShare,
    accessSharedItem,
    copyToClipboard,
    shareViaEmail,
    shareViaSocial,
    updateAnalytics,
    
    // Getters
    getItemById,
    getItemsByType,
    getTrendingItems,
    getRecentItems,
    formatShareMessage,
    
    // Service
    service
  };
};

export default useSharing; 