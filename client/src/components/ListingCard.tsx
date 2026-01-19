import { motion } from "framer-motion";
import { MapPin, Phone, Building2, Users } from "lucide-react";
import { Link } from "wouter";
import type { Listing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: Listing;
  showOwnerControls?: boolean;
  onEdit?: (listing: Listing) => void;
  onDelete?: (id: number) => void;
}

export function ListingCard({ listing, showOwnerControls, onEdit, onDelete }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/room/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer">
        <img 
          src={listing.imageUrls?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-foreground font-bold shadow-sm">
            {formatPrice(listing.price)}/mo
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          <div className="flex items-center text-white/90 text-sm font-medium">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/room/${listing.id}`} className="hover:text-primary transition-colors cursor-pointer">
            <h3 className="font-display font-bold text-lg leading-tight line-clamp-1">{listing.title}</h3>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
          <div className="flex items-center text-muted-foreground text-sm bg-secondary/50 p-2 rounded-lg">
            <Building2 className="w-4 h-4 mr-2 text-primary/80" />
            {listing.propertyType}
          </div>
          <div className="flex items-center text-muted-foreground text-sm bg-secondary/50 p-2 rounded-lg">
            <Users className="w-4 h-4 mr-2 text-primary/80" />
            {listing.tenantPreference}
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
             <Phone className="w-4 h-4 mr-2" />
             <span className="truncate max-w-[120px]">{listing.contactPhone}</span>
          </div>
          
          {showOwnerControls && (
            <div className="flex space-x-2">
              <button 
                onClick={(e) => { e.preventDefault(); onEdit?.(listing); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); onDelete?.(listing.id); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
