import { create } from "zustand";

export interface WidgetConfig {
  id: string;
  title: string;
  type: "jira" | "calendar" | "gmail" | "slack";
  size: "small" | "medium" | "large";
  visible: boolean;
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
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
  {
    id: "slack-widget",
    title: "Slack Today",
    type: "slack",
    size: "medium",
    visible: true,
  },
];

interface DashboardStore {
  layouts: {
    desktop: WidgetConfig[];
    mobile: WidgetConfig[];
  };
  setLayouts: (layouts: {
    desktop: WidgetConfig[];
    mobile: WidgetConfig[];
  }) => void;
  reorderWidgets: (
    activeId: string,
    overId: string,
    breakpoint: "desktop" | "mobile",
  ) => void;
  toggleWidgetVisibility: (
    widgetId: string,
    breakpoint: "desktop" | "mobile",
  ) => void;
  toggleWidgetSize: (
    widgetId: string,
    breakpoint: "desktop" | "mobile",
  ) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  layouts: {
    desktop: DEFAULT_WIDGETS,
    mobile: DEFAULT_WIDGETS,
  },

  setLayouts: (layouts) => set({ layouts }),

  reorderWidgets: (activeId, overId, breakpoint) =>
    set((state) => {
      const widgets = state.layouts[breakpoint];
      const oldIndex = widgets.findIndex((w) => w.id === activeId);
      const newIndex = widgets.findIndex((w) => w.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);

      return {
        layouts: {
          ...state.layouts,
          [breakpoint]: newWidgets,
        },
      };
    }),

  toggleWidgetVisibility: (widgetId, breakpoint) =>
    set((state) => ({
      layouts: {
        ...state.layouts,
        [breakpoint]: state.layouts[breakpoint].map((w) =>
          w.id === widgetId ? { ...w, visible: !w.visible } : w,
        ),
      },
    })),

  toggleWidgetSize: (widgetId, breakpoint) =>
    set((state) => ({
      layouts: {
        ...state.layouts,
        [breakpoint]: state.layouts[breakpoint].map((w) =>
          w.id === widgetId
            ? {
                ...w,
                size:
                  w.size === "medium" || w.size === "small"
                    ? "large"
                    : "medium",
              }
            : w,
        ),
      },
    })),
}));
