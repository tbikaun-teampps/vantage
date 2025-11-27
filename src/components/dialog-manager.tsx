import { createContext, useState, type ReactNode } from "react";

interface DialogConfig {
  id: string;
  content: ReactNode;
  onClose?: () => void;
}

interface DialogManagerContextType {
  openDialog: (config: DialogConfig) => void;
  closeDialog: (id: string) => void;
  closeAllDialogs: () => void;
}

const DialogManagerContext = createContext<DialogManagerContextType | null>(
  null
);

// Provider component with dialog rendering
interface DialogManagerProviderProps {
  children: ReactNode;
}

const DialogManagerProvider: React.FC<DialogManagerProviderProps> = ({
  children,
}) => {
  const [dialogs, setDialogs] = useState<DialogConfig[]>([]);

  const openDialog = (config: DialogConfig) => {
    setDialogs((prev) => {
      // Replace existing dialog with same ID or add new one
      const filtered = prev.filter((d) => d.id !== config.id);
      return [...filtered, config];
    });
  };

  const closeDialog = (id: string) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog?.onClose) {
        dialog.onClose();
      }
      return prev.filter((d) => d.id !== id);
    });
  };

  const closeAllDialogs = () => {
    dialogs.forEach((dialog) => {
      if (dialog.onClose) {
        dialog.onClose();
      }
    });
    setDialogs([]);
  };

  return (
    <DialogManagerContext.Provider
      value={{ openDialog, closeDialog, closeAllDialogs }}
    >
      {children}
      {/* Render all dialogs outside the children hierarchy */}
      {dialogs.map((dialog) => (
        <div key={dialog.id}>{dialog.content}</div>
      ))}
    </DialogManagerContext.Provider>
  );
};

export { DialogManagerProvider };
