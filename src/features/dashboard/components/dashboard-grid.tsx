"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { SortableWidget } from "./sortable-widget";
import {
  JiraWidgetPlaceholder,
  CalendarWidgetContent,
  GmailWidgetContent,
  DailyNotesWidgetPlaceholder,
  AiChatbotWidgetPlaceholder,
} from "./widget-placeholders";

const widgetContentMap: Record<string, React.ComponentType> = {
  "jira-widget": JiraWidgetPlaceholder,
  "calendar-widget": CalendarWidgetContent,
  "gmail-widget": GmailWidgetContent,
  "daily-notes-widget": DailyNotesWidgetPlaceholder,
  "ai-chatbot-widget": AiChatbotWidgetPlaceholder,
};

export function DashboardGrid() {
  const { widgets, reorderWidgets } = useDashboardStore();
  const visibleWidgets = widgets.filter((w) => w.visible);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleWidgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleWidgets.map((widget) => {
            const Content = widgetContentMap[widget.id];
            return (
              <SortableWidget key={widget.id} widget={widget}>
                {Content ? <Content /> : null}
              </SortableWidget>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
