/**
 * 🎯 PROFILE SELECTOR COMPONENT
 * 
 * Componente para seleção múltipla de perfis encontrados na busca
 * Permite ao usuário escolher o perfil correto entre os resultados
 * 
 * @author IA Claude - Profile Selection UI
 * @created 2025-07-18T13:45:00Z
 * @methodology V8.1_PROFILE_SELECTION_INTERFACE
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { InstagramSearchResult } from '../services/instagramSearchService';

// 🎯 PROPS INTERFACE
interface ProfileSelectorProps {
  searchResults: InstagramSearchResult[];
  onSelectProfile: (profile: InstagramSearchResult) => void;
  onCancel: () => void;
  isLoading?: boolean;
  searchQuery: string;
  isSimulated?: boolean;
  fallbackReason?: string;
}

// 🎨 COMPONENT PRINCIPAL
export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  searchResults,
  onSelectProfile,
  onCancel,
  isLoading = false,
  searchQuery,
  isSimulated = false,
  fallbackReason
}) => {
  
  /**
   * 📊 FORMATAR NÚMERO DE SEGUIDORES
   */
  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  /**
   * 🎨 RENDER LOADING STATE
   */
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando perfis para "{searchQuery}"...</p>
        </div>
      </div>
    );
  }

  /**
   * 🎨 RENDER EMPTY STATE
   */
  if (searchResults.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Nenhum perfil encontrado para "{searchQuery}"</p>
        </div>
        <Button onClick={onCancel} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  /**
   * 🎨 RENDER MAIN COMPONENT
   */
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Selecione o perfil correto
        </h3>
        <p className="text-gray-600">
          Encontramos {searchResults.length} perfis para "{searchQuery}"
        </p>
        
        {/* Simulation Badge */}
        {isSimulated && (
          <div className="mt-3 flex justify-center">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              ⚠️ Dados Simulados
            </Badge>
          </div>
        )}
        
        {/* Fallback Reason */}
        {isSimulated && fallbackReason && (
          <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
            <span className="font-medium">Motivo:</span> {fallbackReason}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 mb-6">
        {searchResults.map((profile, index) => (
          <motion.div
            key={profile.pk}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
              onClick={() => onSelectProfile(profile)}
            >
              <div className="flex items-center space-x-4">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <img
                    src={profile.profile_pic_url}
                    alt={`${profile.username} profile`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback para imagem genérica
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=48&background=e5e7eb&color=6b7280`;
                    }}
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {profile.full_name}
                    </h4>
                    {profile.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Verificado
                      </Badge>
                    )}
                    {profile.is_private && (
                      <Badge variant="outline" className="text-xs">
                        🔒 Privado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-1">
                    @{profile.username}
                  </p>
                  
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {profile.bio}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>
                      📊 {formatFollowerCount(profile.follower_count)} seguidores
                    </span>
                  </div>
                </div>

                {/* Selection Arrow */}
                <div className="flex-shrink-0">
                  <svg 
                    className="w-5 h-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={onCancel} 
          variant="outline"
          className="w-32"
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            // Opção de buscar novamente ou criar perfil manual
            console.log('Nenhum perfil encontrado, permitir criação manual');
          }}
          variant="secondary"
          className="w-32"
        >
          Não encontrei
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Clique no perfil correto para continuar com a análise
        </p>
      </div>
    </div>
  );
};

export default ProfileSelector;