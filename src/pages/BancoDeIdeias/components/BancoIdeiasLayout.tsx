/**
 * 🧠 BANCO DE IDEIAS - LAYOUT PRINCIPAL V8.0
 * Professional responsive layout for enterprise-grade UX
 * Following V8.0 Unified Development methodology - Frontend Phase
 */

import React, { useState } from 'react';
import { Layout } from '../../../design-system/components/Layout';
import { Button } from '../../../design-system/components/Button';
import { 
  Menu, 
  X, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Users,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';

import { TabType } from '../types';
import { NAVIGATION_TABS } from '../constants';

// ============================================================================
// LAYOUT PROPS
// ============================================================================

interface BancoIdeiasLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

export const BancoIdeiasLayout: React.FC<BancoIdeiasLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
  sidebarContent,
  showMobileMenu = false,
  onMobileMenuToggle
}) => {
  
  // ============================================================================
  // RESPONSIVE NAVIGATION
  // ============================================================================
  
  const renderTabNavigation = (isMobile = false) => (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-wrap gap-2'}`}>
      {NAVIGATION_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              if (isMobile && onMobileMenuToggle) {
                onMobileMenuToggle();
              }
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${isActive
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }
              ${isMobile ? 'w-full justify-start' : ''}
            `}
          >
            <span className="text-lg">
              {tab.icon === 'Sparkles' && '✨'}
              {tab.icon === 'BarChart3' && '📊'}
              {tab.icon === 'FileText' && '📄'}
              {tab.icon === 'Download' && '⬇️'}
              {tab.icon === 'Activity' && '📈'}
              {tab.icon === 'User' && '👤'}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
  
  // ============================================================================
  // HEADER COMPONENT
  // ============================================================================
  
  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Banco de Ideias
              </h1>
              <p className="text-sm text-neutral-600 hidden sm:block">
                Sistema Inteligente de Geração de Conteúdo
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            {renderTabNavigation()}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="p-2"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden py-4 border-t border-neutral-200">
            {renderTabNavigation(true)}
          </div>
        )}
      </div>
    </header>
  );
  
  // ============================================================================
  // SIDEBAR COMPONENT
  // ============================================================================
  
  const renderSidebar = () => (
    <aside className="w-80 bg-neutral-50 border-l border-neutral-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <Layout.Card variant="outlined" padding="md">
          <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Estatísticas Rápidas
          </Layout.Heading>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Ideias hoje:
              </span>
              <span className="text-sm font-medium">12 / 50</span>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Score médio:
              </span>
              <span className="text-sm font-medium text-green-600">8.7/10</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Público foco:
              </span>
              <span className="text-sm font-medium">Startups</span>
            </div>
          </div>
        </Layout.Card>
        
        {/* Recent Activity */}
        <Layout.Card variant="outlined" padding="md">
          <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Atividade Recente
          </Layout.Heading>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Ideia gerada</p>
                <p className="text-xs text-neutral-600">Marketing para SaaS - há 2 min</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Template aplicado</p>
                <p className="text-xs text-neutral-600">Startup Growth - há 15 min</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Ideias exportadas</p>
                <p className="text-xs text-neutral-600">5 ideias para PDF - há 1h</p>
              </div>
            </div>
          </div>
        </Layout.Card>
        
        {/* Performance Insights */}
        <Layout.Card variant="outlined" padding="md">
          <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Insights de Performance
          </Layout.Heading>
          
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">🎯 Ótima conversão</p>
              <p className="text-xs text-green-600">85% das ideias foram implementadas</p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">📈 Tendência crescente</p>
              <p className="text-xs text-blue-600">+32% ideias esta semana</p>
            </div>
          </div>
        </Layout.Card>
        
        {/* Custom Sidebar Content */}
        {sidebarContent}
      </div>
    </aside>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {renderHeader()}
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {children}
          </div>
        </main>
        
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden xl:block">
          {renderSidebar()}
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onMobileMenuToggle}></div>
          <div className="absolute right-0 top-0 h-full w-80 max-w-sm">
            {renderSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BancoIdeiasLayout; 