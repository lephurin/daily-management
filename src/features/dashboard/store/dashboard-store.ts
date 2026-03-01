import { create } from "zustand";

export interface WidgetConfig {
  id: string;
  title: string;
  type: "jira" | "calendar" | "gmail";
  size: "small" | "medium" | "large";
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "jira-widget",
    title: "Jira Tasks",
    type: "jira",
    size: "medium",
    visible: true,
  },
  {
    id: "calendar-widget",
    title: "Google Calendar",
    type: "calendar",
    size: "medium",
    visible: true,
  },
  {
    id: "gmail-widget",
    title: "Gmail",
    type: "gmail",
    size: "medium",
    visible: true,
  },
];

interface DashboardStore {
  widgets: WidgetConfig[];
  setWidgets: (widgets: WidgetConfig[]) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  toggleWidgetSize: (widgetId: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  widgets: DEFAULT_WIDGETS,

  setWidgets: (widgets) => set({ widgets }),

  reorderWidgets: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.widgets.findIndex((w) => w.id === activeId);
      const newIndex = state.widgets.findIndex((w) => w.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newWidgets = [...state.widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);

      // TODO: Sync with Supabase user_settings
      return { widgets: newWidgets };
    }),

  toggleWidgetVisibility: (widgetId) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w,
      ),
    })),

  toggleWidgetSize: (widgetId) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              size:
                w.size === "medium" || w.size === "small" ? "large" : "medium",
            }
          : w,
      ),
    })),
}));
