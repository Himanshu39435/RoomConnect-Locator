import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertListingSchema, type Listing } from "@shared/schema";
import { useCreateListing, useUpdateListing } from "@/hooks/use-listings";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingToEdit?: Listing;
}

// Schema refinement for client-side form
const formSchema = insertListingSchema.extend({
  // Override or add specific refinements if needed
  imageUrls: z.string().transform((val) => val.split(',').map(url => url.trim()).filter(Boolean)),
});

type FormValues = z.input<typeof formSchema>;

export function ListingFormDialog({ open, onOpenChange, listingToEdit }: ListingFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  const isEditing = !!listingToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      propertyType: "1 BHK",
      tenantPreference: "Bachelor",
      contactPhone: "",
      imageUrls: "", // Handled as comma-separated string in UI
    },
  });

  useEffect(() => {
    if (open) {
      if (listingToEdit) {
        form.reset({
          ...listingToEdit,
          imageUrls: listingToEdit.imageUrls?.join(', ') || "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          location: "",
          price: 0,
          propertyType: "1 BHK",
          tenantPreference: "Bachelor",
          contactPhone: "",
          imageUrls: "",
        });
      }
    }
  }, [open, listingToEdit, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && listingToEdit) {
        // Zod transform handles string -> array for imageUrls
        // We need to cast because react-hook-form types are tricky with transforms
        await updateMutation.mutateAsync({ 
          id: listingToEdit.id, 
          ...values as any 
        });
        toast({ title: "Success", description: "Listing updated successfully" });
      } else {
        await createMutation.mutateAsync(values as any);
        toast({ title: "Success", description: "New room listed successfully" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong", 
        variant: "destructive" 
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Room Details" : "List a New Room"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {isEditing ? "update your listing" : "post a new room for rent"}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Spacious 2BHK near Tech Park" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["1 BHK", "2 BHK", "1 Bed", "2 Bed", "3 Bed"].map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Bachelor", "Family", "Girls", "Working"].map((pref) => (
                          <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent per Month (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15000" 
                        {...field} 
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image1.jpg, https://..." {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Separate multiple URLs with commas</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the room, amenities, and nearby landmarks..." 
                        className="h-32 resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Post Room"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
