// components/disabled-toast.tsx
import { toast } from "sonner";

type ToastContext = "functionality" | "feature" | "page";

export default function showDisabledToast(
  itemTitle: string,
  context: ToastContext = "functionality"
) {
  toast.info(`${itemTitle} ${context} coming soon!`);
}
