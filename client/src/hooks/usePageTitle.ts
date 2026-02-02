import { useEffect } from "react";

/**
 * Hook to set the document title with Vantage branding
 * @param title - The page title (will be formatted as "{title} | Vantage")
 * @param subtitle - Optional subtitle for more specific pages
 */
export function usePageTitle(title?: string, subtitle?: string) {
  useEffect(() => {
    if (title && subtitle) {
      document.title = `${title} | ${subtitle} | Vantage`;
    } else if (title) {
      document.title = `${title} | Vantage`;
    } else {
      document.title = "Vantage | Discover - Improve - Monitor";
    }
  }, [title, subtitle]);
}
