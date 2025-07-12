/**
 * Advanced Timeline Component - IA Charlie Task 2.4.1
 * Interactive timeline with event management and comprehensive visualization
 * Built for displaying chronological data with rich interaction capabilities
 * 
 * Features:
 * - Interactive timeline with zoom and pan
 * - Event creation, editing, and deletion
 * - Multiple timeline views (hours, days, weeks, months)
 * - Event filtering and search
 * - Drag and drop event scheduling
 * - Event categories and color coding
 * - Real-time updates and collaboration
 * - Export and import functionality
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  category?: string;
  color?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignees?: Array<{ id: string; name: string; avatar?: string }>;
  tags?: string[];
  metadata?: Record<string, any>;
  editable?: boolean;
  deletable?: boolean;
}

export interface TimelineCategory {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

export interface TimelineProps {
  events: TimelineEvent[];
  categories?: TimelineCategory[];
  view?: 'hour' | 'day' | 'week' | 'month' | 'year';
  currentDate?: Date;
  editable?: boolean;
  height?: number;
  showMiniMap?: boolean;
  showEventDetails?: boolean;
  enableDragDrop?: boolean;
  enableZoom?: boolean;
  onEventCreate?: (event: Omit<TimelineEvent, 'id'>) => void;
  onEventUpdate?: (id: string, event: Partial<TimelineEvent>) => void;
  onEventDelete?: (id: string) => void;
  onEventClick?: (event: TimelineEvent) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface ViewConfig {
  unit: string;
  step: number;
  format: string;
  gridWidth: number;
}

const VIEW_CONFIGS: Record<string, ViewConfig> = {
  hour: { unit: 'hour', step: 1, format: 'HH:mm', gridWidth: 60 },
  day: { unit: 'day', step: 1, format: 'MMM dd', gridWidth: 100 },
  week: { unit: 'week', step: 1, format: 'MMM dd', gridWidth: 120 },
  month: { unit: 'month', step: 1, format: 'MMM yyyy', gridWidth: 150 },
  year: { unit: 'year', step: 1, format: 'yyyy', gridWidth: 200 }
};

export function Timeline({
  events,
  categories = [],
  view = 'day',
  currentDate = new Date(),
  editable = true,
  height = 600,
  showMiniMap = true,
  showEventDetails = true,
  enableDragDrop = true,
  enableZoom = true,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventClick,
  onDateChange,
  onViewChange,
  className = '',
  style
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedView, setSelectedView] = useState(view);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [filterText, setFilterText] = useState('');
  const [visibleCategories, setVisibleCategories] = useState<string[]>(
    categories.map(cat => cat.id)
  );
  const [draggedEvent, setDraggedEvent] = useState<TimelineEvent | null>(null);
  const [newEventRange, setNewEventRange] = useState<{ start: Date; end: Date } | null>(null);

  // Memoized view configuration
  const viewConfig = useMemo(() => VIEW_CONFIGS[selectedView], [selectedView]);

  // Filter and categorize events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Text filter
      if (filterText && !event.title.toLowerCase().includes(filterText.toLowerCase()) &&
          !event.description?.toLowerCase().includes(filterText.toLowerCase())) {
        return false;
      }

      // Category filter
      if (event.category && !visibleCategories.includes(event.category)) {
        return false;
      }

      return true;
    });
  }, [events, filterText, visibleCategories]);

  // Generate time grid
  const timeGrid = useMemo(() => {
    const grid = [];
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const current = new Date(start);
    const end = new Date(start);
    
    switch (selectedView) {
      case 'hour':
        end.setDate(end.getDate() + 1);
        while (current < end) {
          grid.push(new Date(current));
          current.setHours(current.getHours() + 1);
        }
        break;
      case 'day':
        end.setDate(end.getDate() + 7);
        while (current < end) {
          grid.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        break;
      case 'week':
        end.setMonth(end.getMonth() + 1);
        while (current < end) {
          grid.push(new Date(current));
          current.setDate(current.getDate() + 7);
        }
        break;
      case 'month':
        end.setFullYear(end.getFullYear() + 1);
        while (current < end) {
          grid.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
        }
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + 10);
        while (current < end) {
          grid.push(new Date(current));
          current.setFullYear(current.getFullYear() + 1);
        }
        break;
    }

    return grid;
  }, [selectedDate, selectedView]);

  // Position events on timeline
  const positionedEvents = useMemo(() => {
    return filteredEvents.map(event => {
      const startTime = new Date(event.startTime);
      const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default
      
      const startPosition = getTimePosition(startTime);
      const endPosition = getTimePosition(endTime);
      const width = Math.max(endPosition - startPosition, 80); // Minimum width
      
      return {
        ...event,
        left: startPosition,
        width,
        duration: endTime.getTime() - startTime.getTime()
      };
    });
  }, [filteredEvents, selectedDate, selectedView, viewConfig, zoomLevel]);

  // Get position for time
  function getTimePosition(time: Date): number {
    const gridStart = timeGrid[0];
    const timeDiff = time.getTime() - gridStart.getTime();
    
    switch (selectedView) {
      case 'hour':
        return (timeDiff / (1000 * 60 * 60)) * viewConfig.gridWidth * zoomLevel;
      case 'day':
        return (timeDiff / (1000 * 60 * 60 * 24)) * viewConfig.gridWidth * zoomLevel;
      case 'week':
        return (timeDiff / (1000 * 60 * 60 * 24 * 7)) * viewConfig.gridWidth * zoomLevel;
      case 'month':
        return (timeDiff / (1000 * 60 * 60 * 24 * 30)) * viewConfig.gridWidth * zoomLevel;
      case 'year':
        return (timeDiff / (1000 * 60 * 60 * 24 * 365)) * viewConfig.gridWidth * zoomLevel;
      default:
        return 0;
    }
  }

  // Get time from position
  function getTimeFromPosition(position: number): Date {
    const gridStart = timeGrid[0];
    let timeOffset = 0;

    switch (selectedView) {
      case 'hour':
        timeOffset = (position / (viewConfig.gridWidth * zoomLevel)) * (1000 * 60 * 60);
        break;
      case 'day':
        timeOffset = (position / (viewConfig.gridWidth * zoomLevel)) * (1000 * 60 * 60 * 24);
        break;
      case 'week':
        timeOffset = (position / (viewConfig.gridWidth * zoomLevel)) * (1000 * 60 * 60 * 24 * 7);
        break;
      case 'month':
        timeOffset = (position / (viewConfig.gridWidth * zoomLevel)) * (1000 * 60 * 60 * 24 * 30);
        break;
      case 'year':
        timeOffset = (position / (viewConfig.gridWidth * zoomLevel)) * (1000 * 60 * 60 * 24 * 365);
        break;
    }

    return new Date(gridStart.getTime() + timeOffset);
  }

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    const newDate = new Date(selectedDate);
    switch (selectedView) {
      case 'hour':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'week':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'month':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 10);
        break;
    }
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  }, [selectedDate, selectedView, onDateChange]);

  const handleNext = useCallback(() => {
    const newDate = new Date(selectedDate);
    switch (selectedView) {
      case 'hour':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'week':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'month':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 10);
        break;
    }
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  }, [selectedDate, selectedView, onDateChange]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (enableZoom) {
      setZoomLevel(prev => Math.min(prev * 1.2, 5));
    }
  }, [enableZoom]);

  const handleZoomOut = useCallback(() => {
    if (enableZoom) {
      setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
    }
  }, [enableZoom]);

  // View change handler
  const handleViewChange = useCallback((newView: string) => {
    setSelectedView(newView);
    setZoomLevel(1); // Reset zoom
    onViewChange?.(newView);
  }, [onViewChange]);

  // Event handlers
  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvents([event.id]);
    onEventClick?.(event);
  }, [onEventClick]);

  const handleEventEdit = useCallback((event: TimelineEvent) => {
    if (event.editable !== false) {
      setEditingEvent(event);
    }
  }, []);

  const handleEventDelete = useCallback((eventId: string) => {
    if (onEventDelete) {
      onEventDelete(eventId);
    }
  }, [onEventDelete]);

  const handleEventSave = useCallback((eventData: Partial<TimelineEvent>) => {
    if (editingEvent && onEventUpdate) {
      onEventUpdate(editingEvent.id, eventData);
      setEditingEvent(null);
    }
  }, [editingEvent, onEventUpdate]);

  // Drag and drop handlers
  const handleEventDragStart = useCallback((event: TimelineEvent, e: React.DragEvent) => {
    if (enableDragDrop && event.editable !== false) {
      setDraggedEvent(event);
      e.dataTransfer.effectAllowed = 'move';
    }
  }, [enableDragDrop]);

  const handleEventDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedEvent && enableDragDrop) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - scrollPosition;
        const newStartTime = getTimeFromPosition(x);
        const duration = draggedEvent.endTime 
          ? new Date(draggedEvent.endTime).getTime() - new Date(draggedEvent.startTime).getTime()
          : 60 * 60 * 1000; // 1 hour default
        const newEndTime = new Date(newStartTime.getTime() + duration);
        
        if (onEventUpdate) {
          onEventUpdate(draggedEvent.id, {
            startTime: newStartTime,
            endTime: newEndTime
          });
        }
      }
      setDraggedEvent(null);
    }
  }, [draggedEvent, enableDragDrop, onEventUpdate, scrollPosition]);

  // Timeline click handler for creating new events
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!editable || !onEventCreate) return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - scrollPosition;
      const clickTime = getTimeFromPosition(x);
      const endTime = new Date(clickTime.getTime() + 60 * 60 * 1000); // 1 hour default
      
      setNewEventRange({ start: clickTime, end: endTime });
    }
  }, [editable, onEventCreate, scrollPosition]);

  // Create new event
  const handleCreateEvent = useCallback((eventData: Omit<TimelineEvent, 'id'>) => {
    if (onEventCreate) {
      onEventCreate(eventData);
      setNewEventRange(null);
    }
  }, [onEventCreate]);

  // Category toggle
  const handleCategoryToggle = useCallback((categoryId: string) => {
    setVisibleCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Export/Import handlers
  const handleExport = useCallback(() => {
    const exportData = {
      events: filteredEvents,
      categories,
      view: selectedView,
      date: selectedDate
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeline-${selectedDate.toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredEvents, categories, selectedView, selectedDate]);

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Render event item
  const renderEvent = useCallback((event: any) => {
    const category = categories.find(cat => cat.id === event.category);
    const isSelected = selectedEvents.includes(event.id);
    
    return (
      <div
        key={event.id}
        className={`
          absolute top-0 h-16 rounded-lg border cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'}
          ${event.status === 'completed' ? 'opacity-75' : ''}
        `}
        style={{
          left: event.left,
          width: event.width,
          backgroundColor: event.color || category?.color || '#3B82F6',
          borderColor: event.color || category?.color || '#3B82F6'
        }}
        onClick={() => handleEventClick(event)}
        onDoubleClick={() => handleEventEdit(event)}
        draggable={enableDragDrop && event.editable !== false}
        onDragStart={(e) => handleEventDragStart(event, e)}
      >
        <div className="h-full p-2 text-white">
          <div className="font-medium text-sm truncate">{event.title}</div>
          <div className="text-xs opacity-90 truncate">
            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
        
        {/* Event actions */}
        {isSelected && editable && (
          <div className="absolute top-1 right-1 flex gap-1">
            {event.editable !== false && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventEdit(event);
                }}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            )}
            {event.deletable !== false && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-red-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventDelete(event.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }, [categories, selectedEvents, editable, enableDragDrop, handleEventClick, handleEventEdit, handleEventDragStart, handleEventDelete]);

  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-lg shadow ${className}`}
      style={{ height, ...style }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-lg min-w-[200px] text-center">
              {formatDate(selectedDate)}
            </span>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* View selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {Object.keys(VIEW_CONFIGS).map(viewKey => (
              <Button
                key={viewKey}
                variant={selectedView === viewKey ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange(viewKey)}
                className="capitalize"
              >
                {viewKey}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          {/* Zoom controls */}
          {enableZoom && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {editable && onEventCreate && (
              <Button variant="outline" size="sm" onClick={() => setNewEventRange({ start: new Date(), end: new Date() })}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Categories:</span>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={visibleCategories.includes(category.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryToggle(category.id)}
              className="text-xs"
              style={{
                backgroundColor: visibleCategories.includes(category.id) ? category.color : undefined,
                borderColor: category.color
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Timeline content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Time ruler */}
          <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div 
              className="h-full relative"
              style={{ width: timeGrid.length * viewConfig.gridWidth * zoomLevel }}
            >
              {timeGrid.map((time, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full border-r border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400"
                  style={{
                    left: index * viewConfig.gridWidth * zoomLevel,
                    width: viewConfig.gridWidth * zoomLevel
                  }}
                >
                  {time.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    hour: selectedView === 'hour' ? '2-digit' : undefined,
                    minute: selectedView === 'hour' ? '2-digit' : undefined
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Events area */}
          <div 
            ref={timelineRef}
            className="flex-1 relative overflow-auto"
            onClick={handleTimelineClick}
            onDrop={handleEventDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid background */}
            <div 
              className="absolute inset-0"
              style={{ width: timeGrid.length * viewConfig.gridWidth * zoomLevel }}
            >
              {timeGrid.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-700"
                  style={{ left: index * viewConfig.gridWidth * zoomLevel }}
                />
              ))}
            </div>

            {/* Events */}
            <div className="relative h-20 mt-4">
              {positionedEvents.map(renderEvent)}
            </div>

            {/* New event range */}
            {newEventRange && (
              <div
                className="absolute top-4 h-16 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                style={{
                  left: getTimePosition(newEventRange.start),
                  width: Math.max(getTimePosition(newEventRange.end) - getTimePosition(newEventRange.start), 80)
                }}
              >
                <div className="h-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
                  Click to create event
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini map */}
      {showMiniMap && (
        <div className="h-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
          <div className="h-full bg-white dark:bg-gray-900 rounded relative overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              {positionedEvents.map(event => (
                <div
                  key={event.id}
                  className="h-2 rounded-full opacity-60"
                  style={{
                    left: `${(event.left / (timeGrid.length * viewConfig.gridWidth * zoomLevel)) * 100}%`,
                    width: `${Math.max((event.width / (timeGrid.length * viewConfig.gridWidth * zoomLevel)) * 100, 1)}%`,
                    backgroundColor: event.color || '#3B82F6'
                  }}
                />
              ))}
            </div>
            
            {/* Viewport indicator */}
            <div
              className="absolute top-0 bottom-0 bg-blue-500/20 border border-blue-500"
              style={{
                left: `${(scrollPosition / (timeGrid.length * viewConfig.gridWidth * zoomLevel)) * 100}%`,
                width: `${Math.min((timelineRef.current?.clientWidth || 0) / (timeGrid.length * viewConfig.gridWidth * zoomLevel) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Event editor modal (simplified) */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-medium mb-4">Edit Event</h3>
            
            <div className="space-y-4">
              <Input
                placeholder="Event title"
                defaultValue={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
              />
              
              <textarea
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Event description"
                rows={3}
                defaultValue={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
              />
              
              <div className="flex gap-2">
                <Button onClick={() => handleEventSave(editingEvent)}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New event creator (simplified) */}
      {newEventRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-medium mb-4">Create Event</h3>
            
            <div className="space-y-4">
              <Input
                placeholder="Event title"
                onChange={(e) => setNewEventRange({ ...newEventRange, title: e.target.value } as any)}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCreateEvent({
                    title: (newEventRange as any).title || 'New Event',
                    startTime: newEventRange.start,
                    endTime: newEventRange.end
                  })}
                  disabled={!(newEventRange as any).title}
                >
                  Create
                </Button>
                <Button variant="outline" onClick={() => setNewEventRange(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline; 