import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPhone,
  IconUser,
  IconX,
  IconPencil,
} from "@tabler/icons-react";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type { GetEntityContactsResponseData, Contact } from "@/types/api/companies";

interface ContactListProps {
  contacts: GetEntityContactsResponseData;
  onEditContact?: (
    contact: Contact
  ) => void;
  onRemoveContact?: (contactId: number) => void;
  showRemoveButton?: boolean;
  className?: string;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onEditContact,
  onRemoveContact,
  showRemoveButton = true,
  className = "",
}) => {
  const userCanAdmin = useCanAdmin();
  if (!contacts || contacts.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No contacts assigned
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {contacts.map((contact) => (
        <Badge
          key={contact.id}
          variant="outline"
          className="px-4 py-2 text-sm relative group"
        >
          <div className="flex items-center space-x-2">
            <IconUser className="h-3 w-3" />
            <div className="flex flex-col space-y-1">
              <div className="font-medium">{contact.full_name}</div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                {contact.email && (
                  <div className="flex items-center space-x-1">
                    <IconMail className="h-3 w-3" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-1">
                    <IconPhone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
              {contact.title && (
                <div className="text-xs text-muted-foreground italic">
                  {contact.title}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 ml-3">
            {onEditContact && userCanAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditContact(contact);
                }}
              >
                <IconPencil className="h-3 w-3" />
                <span className="sr-only">Edit contact</span>
              </Button>
            )}

            {showRemoveButton && onRemoveContact && userCanAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveContact(contact.id);
                }}
              >
                <IconX className="h-3 w-3" />
                <span className="sr-only">Remove contact</span>
              </Button>
            )}
          </div>
        </Badge>
      ))}
    </div>
  );
};
