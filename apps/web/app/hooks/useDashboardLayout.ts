import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export interface DashboardCard {
  id: string;
  title: string;
  columnIndex: number;
  rowIndex: number;
}

type LayoutPreferences = Record<string, DashboardCard[]>;

const STORAGE_KEY = 'slotcity-dashboard-layout';

const DEFAULT_LAYOUT: LayoutPreferences = {
  column1: [
    { id: 'live-activity', title: 'Live Activity Feed', columnIndex: 0, rowIndex: 0 },
    { id: 'latest-transactions', title: 'Latest Transactions', columnIndex: 0, rowIndex: 1 },
    { id: 'conversion', title: 'Conversion Funnel', columnIndex: 0, rowIndex: 2 }
  ],
  column2: [
    { id: 'risk-monitor', title: 'Risk Monitor', columnIndex: 1, rowIndex: 0 },
    { id: 'key-metrics', title: 'Key Metrics', columnIndex: 1, rowIndex: 1 },
    { id: 'payment-gateways', title: 'Payment Gateways', columnIndex: 1, rowIndex: 2 }
  ],
  column3: [
    { id: 'player-control', title: 'Player Control Panel', columnIndex: 2, rowIndex: 0 },
    { id: 'bonuses', title: 'Bonuses Overview', columnIndex: 2, rowIndex: 1 },
    { id: 'retention', title: 'Retention Dashboard', columnIndex: 2, rowIndex: 2 }
  ]
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<LayoutPreferences>(DEFAULT_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  const cloneLayout = useCallback((source: LayoutPreferences): LayoutPreferences => {
    return Object.fromEntries(
      Object.entries(source).map(([key, cards]) => [
        key,
        cards.map((card) => ({ ...card }))
      ])
    );
  }, []);

  const persistLayout = useCallback((nextLayout: LayoutPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayout));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LayoutPreferences;
        setLayout(cloneLayout(parsed));
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
    setIsLoaded(true);
  }, [cloneLayout]);

  // Save to localStorage when layout changes
  const saveLayout = useCallback((newLayout: LayoutPreferences) => {
    const nextLayout = cloneLayout(newLayout);
    setLayout(nextLayout);
    persistLayout(nextLayout);
  }, [cloneLayout, persistLayout]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_LAYOUT);
  }, [saveLayout]);

  // Move card between columns
  const moveCard = useCallback(
    (cardId: string, fromColumn: string, toColumn: string, toIndex: number) => {
      setLayout((currentLayout) => {
        const nextLayout = cloneLayout(currentLayout);
        const fromCards = [...(nextLayout[fromColumn] || [])];
        const toCards = fromColumn === toColumn ? fromCards : [...(nextLayout[toColumn] || [])];
        const cardIndex = fromCards.findIndex((card) => card.id === cardId);

        if (cardIndex === -1) {
          return currentLayout;
        }

        const [card] = fromCards.splice(cardIndex, 1);
        const nextColumnIndex = Math.max(parseInt(toColumn.replace('column', ''), 10) - 1, 0);
        const safeIndex = Math.max(0, Math.min(toIndex, toCards.length));
        toCards.splice(safeIndex, 0, {
          ...card,
          columnIndex: nextColumnIndex
        });

        nextLayout[fromColumn] = fromCards.map((item, index) => ({
          ...item,
          rowIndex: index
        }));
        nextLayout[toColumn] = toCards.map((item, index) => ({
          ...item,
          rowIndex: index
        }));

        persistLayout(nextLayout);
        return nextLayout;
      });
    },
    [cloneLayout, persistLayout]
  );

  // Reorder cards within same column
  const reorderCards = useCallback(
    (columnKey: string, fromIndex: number, toIndex: number) => {
      setLayout((currentLayout) => {
        const nextLayout = cloneLayout(currentLayout);
        const column = [...(nextLayout[columnKey] || [])];

        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return currentLayout;
        }

        const reordered = arrayMove(column, fromIndex, toIndex).map((card, index) => ({
          ...card,
          rowIndex: index
        }));

        nextLayout[columnKey] = reordered;
        persistLayout(nextLayout);
        return nextLayout;
      });
    },
    [cloneLayout, persistLayout]
  );

  return {
    layout,
    isLoaded,
    saveLayout,
    resetLayout,
    moveCard,
    reorderCards
  };
}
