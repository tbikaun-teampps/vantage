import { ThemeProvider as CustomThemeProvider } from "@/hooks/use-theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: "dark" | "light" | "system";
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "vantage-theme",
}: ThemeProviderProps) {
  return (
    <CustomThemeProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
    >
      {children}
    </CustomThemeProvider>
  );
}
