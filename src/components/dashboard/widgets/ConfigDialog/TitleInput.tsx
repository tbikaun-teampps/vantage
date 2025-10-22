import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

interface TitleInputProps {
  title?: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
}

export const TitleInput: React.FC<TitleInputProps> = ({
  title,
  onTitleChange,
  placeholder = "Enter widget title",
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Widget Title (optional)</Label>
      <Input
        value={title || ""}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
