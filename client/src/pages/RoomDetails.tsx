import { useParams, Link } from "wouter";
import { useListing } from "@/hooks/use-listings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  ArrowLeft, 
  Building2, 
  Users, 
  CheckCircle2,
  Calendar,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function RoomDetails() {
  const { id } = useParams();
  const listingId = Number(id);
  const { data: listing, isLoading, error } = useListing(listingId);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-6" />
          <div className="h-[400px] bg-muted rounded-2xl mb-8" />
          <div className="h-10 w-2/3 bg-muted rounded mb-4" />
          <div className="h-4 w-1/3 bg-muted rounded mb-8" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Copied!", description: "Link copied to clipboard" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Link>

        {/* Image Gallery - Simple Grid for MVP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden mb-8 h-[400px] md:h-[500px]">
          <div className="h-full">
            <img 
              src={listing.imageUrls?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"} 
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in"
            />
          </div>
          <div className="grid grid-rows-2 gap-4 h-full">
            {listing.imageUrls?.slice(1, 3).map((url, idx) => (
              <img 
                key={idx}
                src={url}
                alt={`${listing.title} - view ${idx + 2}`}
                className="w-full h-full object-cover"
              />
            ))}
            {(!listing.imageUrls || listing.imageUrls.length < 2) && (
              <>
                <div className="bg-muted flex items-center justify-center text-muted-foreground">
                  No additional images
                </div>
                <div className="bg-muted flex items-center justify-center text-muted-foreground">
                  No additional images
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                  {listing.title}
                </h1>
                <Button variant="outline" size="icon" onClick={handleShare} className="shrink-0 rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-muted-foreground items-center mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  {listing.location}
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Posted {format(new Date(listing.createdAt || new Date()), "MMM d, yyyy")}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <Building2 className="w-4 h-4 mr-2" />
                  {listing.propertyType}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100">
                  <Users className="w-4 h-4 mr-2" />
                  Preferred: {listing.tenantPreference}
                </Badge>
              </div>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3 className="text-xl font-bold mb-3 font-display">About this place</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 font-display">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Static amenities for now, could be dynamic later */}
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  Water Supply
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  Electricity
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  Safe Neighborhood
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                  Nearby Transport
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/5">
              <div className="mb-6">
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Rent per month</p>
                <div className="text-4xl font-display font-bold text-primary">
                  {formatPrice(listing.price)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-secondary/50 p-4 rounded-xl flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Owner Contact</p>
                    <p className="text-lg font-bold text-foreground">{listing.contactPhone}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                Contact Owner
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Make sure to visit the property in person before making any payments.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
