import {
  useDashboardStore,
  type WidgetConfig,
} from "@/features/dashboard/store/dashboard-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Settings2,
  GripVertical,
  LayoutTemplate,
  Plus,
  Minus,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const sizeClasses: Record<WidgetConfig["size"], string> = {
  small: "col-span-1",
  medium: "col-span-1",
  large: "col-span-2",
};

function SortablePlaylistItem({ widget }: { widget: WidgetConfig }) {
  const t = useTranslations("DashboardGrid");
  const { toggleWidgetVisibility, toggleWidgetSize } = useDashboardStore();
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col justify-between p-3 bg-card border rounded-lg shadow-sm ${
        sizeClasses[widget.size]
      } ${
        isDragging
          ? "opacity-30 border-dashed ring-2 ring-primary z-50 relative"
          : "transition-all duration-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4 shrink-0" />
          </div>
          <span className="text-sm font-semibold truncate" title={widget.title}>
            {widget.title}
          </span>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => toggleWidgetVisibility(widget.id)}
          title={t("hideWidget")}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-auto pt-2 border-t">
        <span className="text-xs text-muted-foreground">
          {widget.size === "large" ? t("fullWidth") : t("halfWidth")}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={() => toggleWidgetSize(widget.id)}
          title={t("switchSize")}
        >
          <LayoutTemplate className="h-3 w-3 mr-1" />
          {widget.size === "large" ? "2:2" : "1:1"}
        </Button>
      </div>
    </div>
  );
}

export function ManageWidgetsPanel() {
  const t = useTranslations("DashboardGrid");
  const { widgets, setWidgets, toggleWidgetVisibility } = useDashboardStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeWidgets = widgets.filter((w) => w.visible);
  const inactiveWidgets = widgets.filter((w) => !w.visible);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      setWidgets(newWidgets);
    }
  };

  const activeWidget = widgets.find((w) => w.id === activeId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("manageLayout")}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full sm:w-[500px] overflow-y-auto flex flex-col p-4 sm:p-4"
      >
        <SheetHeader className="mb-8 shrink-0">
          <SheetTitle>{t("manageTitle")}</SheetTitle>
          <SheetDescription>{t("manageDesc")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-8">
          {/* Active Widgets Grid Preview */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t("activeWidgets", { count: activeWidgets.length })}
            </h3>

            {activeWidgets.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg bg-muted/30">
                {t("noActive")}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeWidgets.map((w) => w.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-2 grid-flow-dense">
                    {activeWidgets.map((widget) => (
                      <SortablePlaylistItem key={widget.id} widget={widget} />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId && activeWidget ? (
                    <div
                      className={`flex flex-col justify-between p-3 bg-card border ring-2 ring-primary rounded-lg shadow-xl opacity-90 ${sizeClasses[activeWidget.size]}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm font-semibold truncate">
                            {activeWidget.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground shrink-0"
                          disabled
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {activeWidget.size === "large"
                            ? t("fullWidth")
                            : t("halfWidth")}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 px-2 text-[10px] text-muted-foreground"
                          disabled
                        >
                          <LayoutTemplate className="h-3 w-3 mr-1" />
                          {activeWidget.size === "large" ? "2:2" : "1:1"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Inactive Widgets List */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              {t("hiddenWidgets", { count: inactiveWidgets.length })}
            </h3>

            <div className="space-y-2">
              {inactiveWidgets.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg bg-muted/10">
                  {t("noHidden")}
                </div>
              ) : (
                inactiveWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 bg-muted/20 border border-dashed rounded-lg"
                  >
                    <div className="flex items-center space-x-3 opacity-70">
                      <span className="text-sm font-medium pl-1">
                        {widget.title}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0 transition-colors"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      title={t("showWidget")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
