import React from "react";
import { IconUsers } from "@tabler/icons-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center mx-auto">
      <div className="text-center text-muted-foreground">
        <IconUsers className="h-20 w-20 mx-auto mb-6 opacity-20" />
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          Company Structure
        </h3>
        <p className="text-sm max-w-md mx-auto leading-relaxed">
          Select an item from the company tree to configure organisational,
          roles, and reporting structures for your company
        </p>
      </div>
    </div>
  );
};
