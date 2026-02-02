import React from "react";
import { type FormSectionProps } from "../types";

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
};
