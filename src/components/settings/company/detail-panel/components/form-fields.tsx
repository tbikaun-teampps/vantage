import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineLocationMap } from "@/components/inline-location-map";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface FormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
}

interface FormInputProps<TFieldValues extends FieldValues>
  extends FormFieldProps<TFieldValues> {
  placeholder?: string;
  type?: "text" | "number";
  step?: string;
  disabled?: boolean;
}

interface FormSelectProps<TFieldValues extends FieldValues>
  extends FormFieldProps<TFieldValues> {
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

interface FormLocationMapProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  latName: FieldPath<TFieldValues>;
  lngName: FieldPath<TFieldValues>;
  label: string;
  height?: string;
  siteName?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  step,
  disabled = false,
  className = "",
}: FormInputProps<TFieldValues>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Input
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || null)}
              onBlur={field.onBlur}
              id={name}
              name={field.name}
              type={type}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              className={`h-10 ${type === "number" ? "font-mono text-sm" : ""} ${
                fieldState.error ? "border-red-500" : ""
              }`}
            />
            {fieldState.error && (
              <p className="text-sm text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  required=false,
}: FormSelectProps<TFieldValues>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}{required ? " *" : ""}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
              disabled={disabled}
            >
              <SelectTrigger className="h-10" disabled={disabled}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-sm text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}

export function FormLocationMap<TFieldValues extends FieldValues>({
  control,
  latName,
  lngName,
  label,
  height = "300px",
  siteName = "Site",
}: FormLocationMapProps<TFieldValues>) {
  const userCanAdmin = useCanAdmin();

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      <Controller
        control={control}
        name={latName}
        render={({ field: latField }) => (
          <Controller
            control={control}
            name={lngName}
            render={({ field: lngField }) => {
              const hasLocation =
                latField.value != null && lngField.value != null;

              if (!hasLocation) {
                return (
                  <div
                    className="flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8"
                    style={{ height }}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto">
                        <svg
                          className="w-6 h-6 text-muted-foreground/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Location not set
                        </p>
                        {userCanAdmin && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Click the map button below to specify{" "}
                            {siteName.toLowerCase()} coordinates
                          </p>
                        )}
                      </div>
                      {userCanAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            // Set a default location to initialize the map
                            latField.onChange(0);
                            lngField.onChange(0);
                          }}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Set Location
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <InlineLocationMap
                  location={{
                    lat: latField.value,
                    lng: lngField.value,
                  }}
                  onLocationChange={(lat, lng) => {
                    latField.onChange(lat);
                    lngField.onChange(lng);
                  }}
                  height={height}
                />
              );
            }}
          />
        )}
      />
    </div>
  );
}
