import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "./form-fields";
import type { Contact, LinkContactToEntityBodyData } from "@/types/api/companies";

// Contact form data type - uses API type with id for tracking edits
type ContactFormData = LinkContactToEntityBodyData & { id?: number };

// Contact form validation schema
const contactSchema = z.object({
  id: z.number().optional(),
  full_name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().optional(),
  title: z.string().optional(),
});

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  contact?: Contact | null;
  isLoading?: boolean;
  title?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  onSave,
  contact,
  isLoading = false,
  title,
}) => {
  const isEditing = !!contact;
  const dialogTitle = title || (isEditing ? "Edit Contact" : "Add Contact");

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      id: contact?.id,
      full_name: contact?.full_name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      title: contact?.title || "",
    },
  });

  // Reset form when contact changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: contact?.id,
        full_name: contact?.full_name || "",
        email: contact?.email || "",
        phone: contact?.phone || "",
        title: contact?.title || "",
      });
    }
  }, [contact, isOpen, form]);

  const handleSave = async (data: ContactFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Error saving contact:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.stopPropagation(); // Prevent event from bubbling to parent forms
            form.handleSubmit(handleSave)(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="full_name"
              label="Full Name"
              placeholder="Enter contact's full name"
            />

            <FormInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter contact's email address"
            />

            <FormInput
              control={form.control}
              name="phone"
              label="Phone (Optional)"
              placeholder="Enter contact's phone number"
            />

            <FormInput
              control={form.control}
              name="title"
              label="Title (Optional)"
              placeholder="Enter contact's job title"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"} Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
