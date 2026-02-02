import { useState, useEffect, useCallback, useMemo } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Plus, RefreshCcw, Save, X } from "lucide-react";
import { DashboardSelector } from "@/components/dashboard/grid-layout/dashboard-selector";
import { CreateDashboardModal } from "@/components/dashboard/grid-layout/create-dashboard-modal";
import { EmptyDashboardState } from "@/components/dashboard/grid-layout/empty-dashboard-state";
import { AddWidgetsDialog } from "@/components/dashboard/grid-layout/add-widgets-dialog";
import { DialogManagerProvider } from "@/components/dialog-manager";
import {
  DashboardRefreshProvider,
  useDashboardRefresh,
} from "@/contexts/DashboardRefreshContext";
import { useDashboardLayoutManager } from "@/hooks/useDashboardLayouts";
import { getWidget, WidgetContainer } from "@/components/dashboard/widgets";
import { ConfigDialog } from "../widgets/ConfigDialog";
import type {
  Dashboard,
  Widget,
  WidgetConfig,
  WidgetType,
} from "@/types/api/dashboard";
import { Loader } from "@/components/loader";
import type { CreateDashboardBodyData } from "@/types/api/dashboard";

const ReactGridLayout = WidthProvider(RGL);

function GridLayoutContent() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState<number | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<number | null>(
    null
  );
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [dashboardToRename, setDashboardToRename] = useState<Dashboard | null>(
    null
  );
  const [newDashboardName, setNewDashboardName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAddWidgetsDialogOpen, setIsAddWidgetsDialogOpen] = useState(false);
  const [pendingDashboard, setPendingDashboard] = useState<{
    widgets: Widget[];
    layout: RGL.Layout[];
  } | null>(null);

  const { refreshAll } = useDashboardRefresh();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshAll();
    // Keep the refreshing state for at least 2 seconds to show visual feedback
    setTimeout(() => setIsRefreshing(false), 2000);
  };
  const {
    dashboards,
    isLoading,
    error,
    createDashboard,
    updateDashboard,
    renameDashboard,
    deleteDashboard,
  } = useDashboardLayoutManager();

  // Helper to get current dashboard (memoized to prevent unnecessary re-renders)
  const currentDashboard = useMemo(
    () => dashboards.find((d) => d.id === currentDashboardId) || null,
    [dashboards, currentDashboardId]
  );

  // Set initial dashboard if none selected
  useEffect(() => {
    if (dashboards.length > 0 && !currentDashboardId) {
      setCurrentDashboardId(dashboards[0].id);
    }
  }, [dashboards, currentDashboardId]);

  // Function to add a new widget
  const addWidget = useCallback(
    (widgetType: WidgetType) => {
      if (!currentDashboard) return;

      const widget = getWidget(widgetType);
      if (!widget) return;

      const newId = `${widgetType}-${Date.now()}`;
      const newItem: Widget = {
        id: newId,
        widgetType: widgetType,
        config: {}, // Start with empty config
      };

      // Use pending state or current state as base
      const baseLayout = pendingDashboard?.layout ?? currentDashboard.layout;
      const baseWidgets = pendingDashboard?.widgets ?? currentDashboard.widgets;

      // Find the bottom-most Y position of existing widgets
      const maxY = baseLayout.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0
      );

      // Create layout entry with defaultSize
      const newLayoutItem: RGL.Layout = {
        i: newId,
        x: 0, // Start at leftmost column
        y: maxY, // Place below existing widgets
        ...widget.defaultSize,
      };

      const updatedWidgets = [...baseWidgets, newItem];
      const updatedLayout = [...baseLayout, newLayoutItem];

      // Update pending state
      setPendingDashboard({ widgets: updatedWidgets, layout: updatedLayout });
    },
    [currentDashboard, pendingDashboard]
  );

  // Dashboard management functions
  const handleCreateDashboard = async (name: string, templateId: string) => {
    const templates: Record<string, string[]> = {
      blank: [],
      analytics: ["metric", "chart", "activity"],
      executive: ["metric", "chart"],
      operations: ["activity", "actions", "metric"],
      personal: ["actions", "metric"],
    };

    const templateWidgets = templates[templateId] || [];
    const widgets = templateWidgets.map((widgetType, index) => ({
      id: `${widgetType}-${Date.now()}-${index}`,
      widgetType: widgetType as WidgetType,
      config: {},
    }));

    const newDashboard: CreateDashboardBodyData = {
      name,
      widgets,
      layout: [], // Start with empty layout; user can arrange later
    };

    const created = await createDashboard(newDashboard);
    if (created) {
      setCurrentDashboardId(created.id);
    }
  };

  const handleLayoutChange = (newLayout: RGL.Layout[]) => {
    if (!currentDashboard || !pendingDashboard) return;
    // Update layout in pending state
    setPendingDashboard({ ...pendingDashboard, layout: newLayout });
  };

  const handleToggleEditMode = async () => {
    if (!currentDashboard) return;

    // If turning edit mode OFF (saving), persist any pending changes
    if (isEditMode && pendingDashboard) {
      await updateDashboard({
        dashboardId: currentDashboard.id,
        updates: pendingDashboard,
      });
      setPendingDashboard(null);
    }

    // If turning edit mode ON, initialize pending state with current state
    if (!isEditMode) {
      setPendingDashboard({
        widgets: currentDashboard.widgets,
        layout: currentDashboard.layout,
      });
    }

    setIsEditMode(!isEditMode);
  };

  const handleCancelEdit = () => {
    // Discard pending changes and exit edit mode without saving
    setPendingDashboard(null);
    setIsEditMode(false);
  };

  const handleDeleteDashboard = (dashboardId: number) => {
    if (dashboards.length <= 1) return; // Don't delete the last dashboard

    setDashboardToDelete(dashboardId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDashboard = async () => {
    if (!dashboardToDelete) return;

    await deleteDashboard(dashboardToDelete);

    if (currentDashboardId === dashboardToDelete) {
      const remaining = dashboards.filter(
        (d: Dashboard) => d.id !== dashboardToDelete
      );
      setCurrentDashboardId(remaining[0]?.id || null);
    }

    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const cancelDeleteDashboard = () => {
    setDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const handleRenameDashboard = (dashboardId: number) => {
    const dashboard = dashboards.find((d: Dashboard) => d.id === dashboardId);
    if (!dashboard) return;

    setDashboardToRename(dashboard);
    setNewDashboardName(dashboard.name);
    setRenameDialogOpen(true);
  };

  const confirmRenameDashboard = async () => {
    if (!dashboardToRename || !newDashboardName.trim()) return;

    await renameDashboard(dashboardToRename.id, newDashboardName.trim());
    setRenameDialogOpen(false);
    setDashboardToRename(null);
    setNewDashboardName("");
  };

  const cancelRenameDashboard = () => {
    setRenameDialogOpen(false);
    setDashboardToRename(null);
    setNewDashboardName("");
  };

  const removeWidget = useCallback(
    (widgetId: string) => {
      if (!currentDashboard || !pendingDashboard) return;

      const updatedWidgets = pendingDashboard.widgets.filter(
        (w: Widget) => w.id !== widgetId
      );
      const updatedLayout = pendingDashboard.layout.filter(
        (item: RGL.Layout) => item.i !== widgetId
      );

      setPendingDashboard({ widgets: updatedWidgets, layout: updatedLayout });
    },
    [currentDashboard, pendingDashboard]
  );

  // Widget configuration management
  const handleWidgetConfigChange = (
    widgetItemId: string,
    newConfig: WidgetConfig
  ) => {
    if (!currentDashboard || !pendingDashboard) return;

    const updatedWidgets = pendingDashboard.widgets.map((w: Widget) =>
      w.id === widgetItemId ? { ...w, config: newConfig } : w
    );

    setPendingDashboard({ ...pendingDashboard, widgets: updatedWidgets });
  };

  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean;
    widgetId: string | null;
    widgetType: WidgetType | null;
    config?: WidgetConfig;
  }>({
    isOpen: false,
    widgetId: null,
    widgetType: null,
  });

  const openConfig = (
    widgetId: string,
    widgetType: WidgetType,
    config: WidgetConfig
  ) => {
    setConfigDialog({
      isOpen: true,
      widgetId,
      widgetType,
      config,
    });
  };

  const closeConfig = () => {
    setConfigDialog({ isOpen: false, widgetId: null, widgetType: null });
  };

  const handleSaveConfig = (widgetId: string, newConfig: WidgetConfig) => {
    // Update widget configuration
    handleWidgetConfigChange(widgetId, newConfig);
    closeConfig();
  };

  return (
    <DialogManagerProvider>
      <div className="flex h-screen">
        {/* Main content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-destructive">
                Error loading dashboards: {error.message}
              </div>
            </div>
          )}

          {/* Dashboard content */}
          {!isLoading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <DashboardSelector
                  dashboards={dashboards}
                  currentDashboard={currentDashboard}
                  onSelectDashboard={setCurrentDashboardId}
                  onCreateDashboard={() => setIsCreateModalOpen(true)}
                  onRenameDashboard={handleRenameDashboard}
                  onDeleteDashboard={handleDeleteDashboard}
                />
                <div className="flex gap-2">
                  {isEditMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddWidgetsDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Widget
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleToggleEditMode}
                        className="flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleEditMode}
                      className="flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCcw
                      size={16}
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
              </div>

              {currentDashboard && (
                <div
                  className={`grid-container ${isEditMode ? "border border-dashed border-border rounded-xl" : ""} `}
                >
                  {(pendingDashboard?.widgets ?? currentDashboard.widgets)
                    .length === 0 ? (
                    <EmptyDashboardState
                      onAddWidgets={() => {
                        if (!isEditMode) {
                          setPendingDashboard({
                            widgets: currentDashboard.widgets,
                            layout: currentDashboard.layout,
                          });
                          setIsEditMode(true);
                        }
                        setIsAddWidgetsDialogOpen(true);
                      }}
                    />
                  ) : (
                    <ReactGridLayout
                      className="layout"
                      layout={
                        pendingDashboard?.layout ?? currentDashboard.layout
                      }
                      rowHeight={60}
                      isDraggable={isEditMode}
                      isResizable={isEditMode}
                      margin={[16, 16]}
                      containerPadding={[0, 0]}
                      verticalCompact={true}
                      onLayoutChange={handleLayoutChange}
                    >
                      {(
                        pendingDashboard?.widgets ?? currentDashboard.widgets
                      ).map((widget: Widget) => (
                        <div key={widget.id}>
                          <WidgetContainer
                            widget={widget}
                            isEditMode={isEditMode}
                            onRemove={() => removeWidget(widget.id)}
                            onConfigClick={() =>
                              openConfig(
                                widget.id,
                                widget.widgetType,
                                widget.config || {}
                              )
                            }
                          />
                        </div>
                      ))}
                    </ReactGridLayout>
                  )}
                  {configDialog.isOpen &&
                    configDialog.widgetId &&
                    configDialog.widgetType && (
                      <ConfigDialog
                        isOpen={configDialog.isOpen}
                        widgetId={configDialog.widgetId}
                        widgetType={configDialog.widgetType}
                        config={configDialog.config}
                        onClose={closeConfig}
                        onSave={handleSaveConfig}
                      />
                    )}
                </div>
              )}

              <CreateDashboardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateDashboard={handleCreateDashboard}
              />

              <AddWidgetsDialog
                isOpen={isAddWidgetsDialogOpen}
                onClose={() => setIsAddWidgetsDialogOpen(false)}
                onAddWidget={addWidget}
              />

              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this dashboard? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelDeleteDashboard}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteDashboard}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Dashboard
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog
                open={renameDialogOpen}
                onOpenChange={setRenameDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename Dashboard</DialogTitle>
                    <DialogDescription>
                      Enter a new name for "{dashboardToRename?.name}".
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      value={newDashboardName}
                      onChange={(e) => setNewDashboardName(e.target.value)}
                      placeholder="Dashboard name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          confirmRenameDashboard();
                        } else if (e.key === "Escape") {
                          cancelRenameDashboard();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={cancelRenameDashboard}>
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmRenameDashboard}
                      disabled={!newDashboardName.trim()}
                    >
                      Rename
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </DialogManagerProvider>
  );
}

export function GridLayout() {
  return (
    <DashboardRefreshProvider>
      <GridLayoutContent />
    </DashboardRefreshProvider>
  );
}
