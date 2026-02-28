"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import type { WidgetConfig } from "@/features/dashboard/store/dashboard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SortableWidgetProps {
  widget: WidgetConfig;
  children: ReactNode;
}

const sizeClasses: Record<WidgetConfig["size"], string> = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 row-span-1 md:col-span-1",
  large: "col-span-1 md:col-span-2 row-span-1",
};

export function SortableWidget({ widget, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${sizeClasses[widget.size]} ${
        isDragging ? "z-50 opacity-80 shadow-2xl" : ""
      } transition-shadow hover:shadow-lg`}
    >
      <CardHeader
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <CardTitle className="flex items-center gap-2 text-base">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
