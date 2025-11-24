import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { IconX, IconCheck } from "@tabler/icons-react";
import { ratingScaleSets } from "@/lib/library/rating-scales";
import { useRatingScaleActions } from "@/hooks/questionnaire/useRatingScales";
import type {
  BatchCreateQuestionnaireRatingScalesBodyData,
  GetQuestionnaireRatingScalesResponseData,
} from "@/types/api/questionnaire";

// Zod schema for rating scale creation
const ratingScaleSchema = z.object({
  value: z.coerce.number().min(1, "Rating value must be at least 1"),
  name: z
    .string()
    .min(1, "Rating name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .or(z.literal("")),
});

type RatingScaleData = z.infer<typeof ratingScaleSchema>;

interface AddRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: number;
  ratings: GetQuestionnaireRatingScalesResponseData;
}

export default function AddRatingDialog({
  open,
  onOpenChange,
  questionnaireId,
  ratings,
}: AddRatingDialogProps) {
  const {
    createRatingScale,
    isCreatingRatingScale,
    createRatingScalesBatch,
    isCreatingRatingScalesBatch,
  } = useRatingScaleActions(questionnaireId);
  const [selectedTab, setSelectedTab] = useState("create");
  const [selectedScaleSet, setSelectedScaleSet] = useState<
    (typeof ratingScaleSets)[0] | null
  >(null);

  // Initialize React Hook Form with Zod validation
  const form = useForm<RatingScaleData>({
    resolver: zodResolver(ratingScaleSchema),
    defaultValues: {
      value: 1,
      name: "",
      description: "",
    },
  });

  // Custom validation for duplicates
  const validateDuplicates = (data: RatingScaleData) => {
    // Check for duplicate values
    const existingRating = ratings.find((r) => r.value === data.value);
    if (existingRating) {
      form.setError("value", { message: "This rating value already exists" });
      return false;
    }

    // Check for duplicate names
    const existingName = ratings.find(
      (r) => r.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existingName) {
      form.setError("name", { message: "This rating name already exists" });
      return false;
    }

    return true;
  };

  const handleAdd = async (data: RatingScaleData) => {
    // Validate duplicates
    if (!validateDuplicates(data)) return;
    await createRatingScale({
      questionnaireId,
      ratingData: {
        value: data.value,
        name: data.name.trim(),
        description: data.description?.trim() || "",
      },
    });

    form.reset();
    onOpenChange(false);
  };

  const handleUseRatingSet = async (
    data: BatchCreateQuestionnaireRatingScalesBodyData
  ) => {
    await createRatingScalesBatch(data);

    form.reset();
    onOpenChange(false);
    setSelectedTab("create");
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
    setSelectedTab("create");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Rating</DialogTitle>
          <DialogDescription>
            Create individual rating levels or choose from pre-built rating
            scale sets.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Individual</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Form {...form}>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          placeholder="e.g., 1, 2, 3..."
                          disabled={
                            isCreatingRatingScalesBatch || isCreatingRatingScale
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Poor, Good, Excellent"
                          disabled={
                            isCreatingRatingScalesBatch || isCreatingRatingScale
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Description of what this rating level means... (optional)"
                        className="min-h-[80px]"
                        disabled={
                          isCreatingRatingScalesBatch || isCreatingRatingScale
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <ScrollArea className="h-[400px] w-full px-2">
              <div className="space-y-4">
                {ratingScaleSets.map((scaleSet) => (
                  <Card
                    key={scaleSet.id}
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      selectedScaleSet?.id === scaleSet.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedScaleSet(scaleSet)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex justify-between w-full">
                            <h4 className="font-medium text-sm">
                              {scaleSet.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {scaleSet.category}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {scaleSet.description}
                        </p>

                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Rating Levels ({scaleSet.scales.length})
                          </h5>
                          <div className="grid grid-cols-1 gap-2">
                            {scaleSet.scales.map((scale) => (
                              <div
                                key={scale.value}
                                className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                              >
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {scale.value}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium">
                                    {scale.name}
                                  </span>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {scale.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isCreatingRatingScalesBatch || isCreatingRatingScale}
          >
            <IconX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          {selectedTab === "create" && (
            <Button
              onClick={form.handleSubmit(handleAdd)}
              disabled={
                isCreatingRatingScalesBatch ||
                isCreatingRatingScale ||
                !form.formState.isValid
              }
            >
              <IconCheck className="h-4 w-4 mr-2" />
              {isCreatingRatingScalesBatch || isCreatingRatingScale
                ? "Adding..."
                : "Add Rating"}
            </Button>
          )}
          {selectedTab === "library" && selectedScaleSet && (
            <Button
              onClick={() =>
                handleUseRatingSet({ scales: selectedScaleSet.scales })
              }
              disabled={isCreatingRatingScalesBatch || isCreatingRatingScale}
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Use {selectedScaleSet.name}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
