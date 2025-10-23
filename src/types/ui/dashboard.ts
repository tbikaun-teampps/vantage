export interface DashboardPageProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showBack?: boolean;
  backHref?: string; // If provided, uses static Link
  onBack?: () => void;
  tourId?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export interface BackButtonProps {
  href: string;
  children?: React.ReactNode;
}

export interface BackButtonDynamicProps {
  onBack?: () => void;
  children?: React.ReactNode;
}