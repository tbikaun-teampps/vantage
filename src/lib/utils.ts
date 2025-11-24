import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get role badge details based on role string
 * @param role
 * @returns
 */
export const getRoleBadge = (role: string) => {
  switch (role) {
    case "owner":
      return { variant: "default" as const, text: "Owner" };
    case "admin":
      return { variant: "secondary" as const, text: "Admin" };
    case "viewer":
      return { variant: "outline" as const, text: "Viewer" };
    default:
      return { variant: "outline" as const, text: role };
  }
};
