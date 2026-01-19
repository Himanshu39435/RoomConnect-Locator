import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListings, useDeleteListing } from "@/hooks/use-listings";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { ListingFormDialog } from "@/components/ListingFormDialog";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  LayoutDashboard, 
  Loader2, 
  ArrowRight,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Listing } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState<Listing | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch only user's listings? 
  // API currently doesn't filter by ownerId on the public endpoint easily
  // In a real app we'd have /api/my-listings. 
  // For now, let's fetch all and filter client side (not efficient but works for MVP)
  const { data: listings, isLoading: isListingsLoading } = useListings();
  
  const userListings = listings?.filter(l => l.ownerId === user?.id);
  
  const deleteMutation = useDeleteListing();

  const handleEdit = (listing: Listing) => {
    setListingToEdit(listing);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        toast({ title: "Deleted", description: "Listing removed successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
      }
      setDeleteId(null);
    }
  };

  const handleCreateNew = () => {
    setListingToEdit(undefined);
    setIsFormOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your properties and listings</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Add New Room
          </Button>
        </div>

        {isListingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[300px] bg-muted/20 rounded-xl animate-pulse" />)}
          </div>
        ) : userListings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border text-center">
            <div className="bg-secondary p-6 rounded-full mb-6">
              <Home className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No listings yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              You haven't posted any rooms for rent yet. Create your first listing to start reaching potential tenants.
            </p>
            <Button onClick={handleCreateNew} variant="outline" size="lg">
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userListings?.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                showOwnerControls={true}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Forms and Dialogs */}
      <ListingFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        listingToEdit={listingToEdit} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your room listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </div>
  );
}
