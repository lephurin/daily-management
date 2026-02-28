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
} from "./widget-placeholders";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const widgetContentMap: Record<string, React.ComponentType> = {
  "jira-widget": JiraWidgetPlaceholder,
  "calendar-widget": CalendarWidgetContent,
  "gmail-widget": GmailWidgetContent,
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {visibleWidgets.map((widget) => {
            const Content = widgetContentMap[widget.id];
            return (
              <motion.div variants={itemVariants} key={widget.id}>
                <SortableWidget widget={widget}>
                  {Content ? <Content /> : null}
                </SortableWidget>
              </motion.div>
            );
          })}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}
