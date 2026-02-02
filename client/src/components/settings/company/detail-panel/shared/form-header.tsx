import React from "react";
import { type FormHeaderProps } from "../types";

export const FormHeader: React.FC<
  FormHeaderProps & {
    actions?: React.ReactNode;
  }
> = ({ icon: Icon, iconColor, title, description, actions }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div
          className={`h-8 w-8 rounded-md ${iconColor} flex items-center justify-center`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
};
