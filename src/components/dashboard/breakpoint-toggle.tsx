import { Layout, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Breakpoint = "default" | "mobile" | "tablet" | "desktop";

interface BreakpointToggleProps {
  value: Breakpoint;
  onChange: (value: Breakpoint) => void;
}

export function BreakpointToggle({
  value,
  onChange,
}: Readonly<BreakpointToggleProps>) {
  return (
    <TooltipProvider>
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={value === "default" ? "outline-primary" : "outline"}
                onClick={() => onChange("default")}
              >
                <Layout className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Default (responsive)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={value === "mobile" ? "outline-primary" : "outline"}
                onClick={() => onChange("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Mobile (480px)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={value === "tablet" ? "outline-primary" : "outline"}
                onClick={() => onChange("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Tablet (1024px)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={value === "desktop" ? "outline-primary" : "outline"}
                onClick={() => onChange("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Desktop (1536px)</TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </TooltipProvider>
  );
}
