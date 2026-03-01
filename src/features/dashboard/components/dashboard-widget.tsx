import type { ReactNode } from "react";
import type { WidgetConfig } from "@/features/dashboard/store/dashboard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardWidgetProps {
  widget: WidgetConfig;
  children: ReactNode;
}

const sizeClasses: Record<WidgetConfig["size"], string> = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 row-span-1 md:col-span-1",
  large: "col-span-1 md:col-span-2 row-span-1",
};

export function DashboardWidget({ widget, children }: DashboardWidgetProps) {
  return (
    <Card
      className={`relative ${sizeClasses[widget.size]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
