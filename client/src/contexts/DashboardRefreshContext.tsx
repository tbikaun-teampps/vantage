import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardRefreshContextType {
  refreshAll: () => void;
}

const DashboardRefreshContext = createContext<DashboardRefreshContextType | undefined>(undefined);

export function DashboardRefreshProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'widget',
    });
  }, [queryClient]);

  return (
    <DashboardRefreshContext.Provider value={{ refreshAll }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}

export function useDashboardRefresh() {
  const context = useContext(DashboardRefreshContext);
  if (context === undefined) {
    throw new Error('useDashboardRefresh must be used within a DashboardRefreshProvider');
  }
  return context;
}