import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { useListings } from "@/hooks/use-listings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin, X, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  // State for filters
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [tenantPreference, setTenantPreference] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  // Derive min/max price
  let minPrice, maxPrice;
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    minPrice = min;
    maxPrice = max;
  }

  // Fetch listings
  const { data: listings, isLoading, error } = useListings({
    location: location || undefined,
    propertyType: propertyType !== "all" ? propertyType as any : undefined,
    tenantPreference: tenantPreference !== "all" ? tenantPreference as any : undefined,
    minPrice,
    maxPrice,
  });

  const clearFilters = () => {
    setLocation("");
    setPropertyType("all");
    setTenantPreference("all");
    setPriceRange("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-foreground py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-6"
          >
            Find Your Perfect <span className="text-primary">Space</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12"
          >
            Discover thousands of rooms, flats, and shared accommodations verified by our community.
          </motion.p>

          {/* Search Bar - Main */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Where do you want to live?" 
                className="pl-10 h-12 text-base border-transparent bg-secondary/30 focus-visible:bg-white focus-visible:ring-primary/20"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full md:w-[180px] h-12 border-transparent bg-secondary/30">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Type</SelectItem>
                <SelectItem value="1 BHK">1 BHK</SelectItem>
                <SelectItem value="2 BHK">2 BHK</SelectItem>
                <SelectItem value="1 Bed">1 Bed</SelectItem>
                <SelectItem value="2 Bed">2 Bed</SelectItem>
                <SelectItem value="3 Bed">3 Bed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tenantPreference} onValueChange={setTenantPreference}>
              <SelectTrigger className="w-full md:w-[180px] h-12 border-transparent bg-secondary/30">
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Preference</SelectItem>
                <SelectItem value="Bachelor">Bachelor</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Girls">Girls Only</SelectItem>
                <SelectItem value="Working">Working Pro</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/25">
              Search
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Available Rooms</h2>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {listings?.length || 0} results
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-5000">Under ₹5k</SelectItem>
                <SelectItem value="5000-10000">₹5k - ₹10k</SelectItem>
                <SelectItem value="10000-20000">₹10k - ₹20k</SelectItem>
                <SelectItem value="20000-100000">Above ₹20k</SelectItem>
              </SelectContent>
            </Select>

            {(location || propertyType !== "all" || tenantPreference !== "all" || priceRange !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[380px] bg-muted/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold mb-2">Could not load listings</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : listings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed border-border">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No rooms found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              We couldn't find any rooms matching your criteria. Try adjusting your filters or location.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
