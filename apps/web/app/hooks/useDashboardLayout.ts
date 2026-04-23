import { useState, useEffect, useCallback, useMemo } from 'react';

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LayoutPreferences;
        setLayout(parsed);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when layout changes
  const saveLayout = useCallback((newLayout: LayoutPreferences) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_LAYOUT);
  }, [saveLayout]);

  // Move card between columns
  const moveCard = useCallback(
    (cardId: string, fromColumn: string, toColumn: string, toIndex: number) => {
      const newLayout = { ...layout };

      // Find and remove card from source column
      const fromCards = newLayout[fromColumn] || [];
      const cardIndex = fromCards.findIndex((c) => c.id === cardId);

      if (cardIndex === -1) return;

      const [card] = fromCards.splice(cardIndex, 1);

      // Add card to destination column
      const toCards = newLayout[toColumn] || [];
      card.columnIndex = parseInt(toColumn.replace('column', '')) - 1;
      toCards.splice(toIndex, 0, card);

      // Update row indices for both columns
      newLayout[fromColumn] = fromCards.map((c, i) => ({
        ...c,
        rowIndex: i
      }));
      newLayout[toColumn] = toCards.map((c, i) => ({
        ...c,
        rowIndex: i
      }));

      saveLayout(newLayout);
    },
    [layout, saveLayout]
  );

  // Reorder cards within same column
  const reorderCards = useCallback(
    (columnKey: string, fromIndex: number, toIndex: number) => {
      const newLayout = { ...layout };
      const column = [...(newLayout[columnKey] || [])];

      const [card] = column.splice(fromIndex, 1);
      column.splice(toIndex, 0, card);

      newLayout[columnKey] = column.map((c, i) => ({
        ...c,
        rowIndex: i
      }));

      saveLayout(newLayout);
    },
    [layout, saveLayout]
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
