import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Activity, Clock, Zap, FileText } from "lucide-react";

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  widgets: string[];
}

interface CreateDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDashboard: (name: string, template: string) => void;
}

const templates: DashboardTemplate[] = [
  {
    id: "blank",
    name: "Blank Dashboard",
    description: "Start with an empty dashboard",
    icon: FileText,
    widgets: [],
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Charts and performance metrics",
    icon: BarChart3,
    widgets: ["metric", "chart", "activity"],
  },
  {
    id: "executive",
    name: "Executive Overview",
    description: "High-level KPIs and summaries",
    icon: Activity,
    widgets: ["metric", "chart"],
  },
  {
    id: "operations",
    name: "Operations Monitor",
    description: "Real-time monitoring and actions",
    icon: Clock,
    widgets: ["activity", "actions", "metric"],
  },
  {
    id: "personal",
    name: "Personal Dashboard",
    description: "Quick actions and personal metrics",
    icon: Zap,
    widgets: ["actions", "metric"],
  },
];

export function CreateDashboardModal({
  isOpen,
  onClose,
  onCreateDashboard,
}: CreateDashboardModalProps) {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("analytics");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await onCreateDashboard(name.trim(), selectedTemplate);
      setName("");
      setSelectedTemplate("analytics");
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setSelectedTemplate("analytics");
    onClose();
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Choose a name and template for your new dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              placeholder="e.g., Analytics Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <template.icon size={16} />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateData && (
              <p className="text-sm text-muted-foreground">
                {selectedTemplateData.description}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}