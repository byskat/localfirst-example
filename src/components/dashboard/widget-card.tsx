import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface WidgetCardProps {
  title: string;
  description?: string;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete: () => void;
  children: ReactNode;
}

export function WidgetCard({
  title,
  description,
  canEdit,
  onEdit,
  onDelete,
  children,
}: Readonly<WidgetCardProps>) {
  return (
    <Card className="h-full border flex flex-col pt-3 pb-4">
      <CardContent className="flex-1 flex flex-col p-0 gap-4 h-full">
        <div className="flex items-start justify-between gap-2 px-4 pb-3 border-b">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <CardTitle className="text-lg p-0">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {canEdit && (
            <ButtonGroup>
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onEdit}
                  title="Edit widget"
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                title="Delete widget"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="drag-handle cursor-grab active:cursor-grabbing"
                title="Drag to move"
                type="button"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          )}
        </div>
        <div className="flex-1 px-4 relative min-h-0">{children}</div>
      </CardContent>
    </Card>
  );
}
