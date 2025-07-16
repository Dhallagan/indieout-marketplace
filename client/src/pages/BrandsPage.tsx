import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStores } from '@/services/storeService';
import type { Store } from '@/types/api-generated';

// Extended Store type to handle the logo object structure from API
interface StoreWithLogo extends Store {
  logo?: string | {
    thumb?: string;
    medium?: string;
    large?: string;
    original?: string;
  };
}

// Helper to get logo URL from store data
const getLogoUrl = (store: StoreWithLogo): string | null => {
  if (!store.logo) return null;
  
  if (typeof store.logo === 'string') {
    return store.logo;
  }
  
  // Return the first available size
  return store.logo.medium || store.logo.large || store.logo.original || store.logo.thumb || null;
};

export default function BrandsPage() {
  const [stores, setStores] = useState<StoreWithLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const stores = await getPublicStores();
        console.log('Fetched stores:', stores);
        // Log Peak Forge Co data specifically
        const peakForge = stores.find(s => s.name.includes('Peak Forge'));
        if (peakForge) {
          console.log('Peak Forge Co data:', peakForge);
          console.log('Peak Forge logo:', peakForge.logo);
        }
        setStores(stores);
      } catch (err) {
        setError('Failed to load brands');
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Loading Header */}
        <div className="border-b border-sand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-sand-200 rounded w-48 mb-2"></div>
              <div className="h-6 bg-sand-200 rounded w-96"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-square bg-sand-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-clay-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-charcoal-900 mb-2">Our Brands</h1>
            <p className="text-lg text-charcoal-600">
              {stores.length} independent makers, each with their own story
            </p>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {stores.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏔️</div>
            <p className="text-charcoal-500 text-lg">No brands available at the moment.</p>
            <p className="text-charcoal-400 mt-2">Check back soon for exciting outdoor brands!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                to={`/shop/stores/${store.slug}`}
                className="group relative aspect-square"
              >
                {/* Logo Container */}
                <div className="relative w-full h-full bg-white border-2 border-sand-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-forest-400 hover:shadow-xl hover:-translate-y-1">
                  {getLogoUrl(store) ? (
                    <img
                      src={getLogoUrl(store)!}
                      alt={store.name}
                      className="w-full h-full object-contain p-6"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand-50 to-sand-100">
                      <span className="text-4xl font-bold text-sand-400">
                        {store.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-charcoal-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <h3 className="text-white font-bold text-center mb-2 line-clamp-2">
                      {store.name}
                    </h3>
                    {store.description && (
                      <p className="text-sand-100 text-xs text-center line-clamp-3 mb-3">
                        {store.description}
                      </p>
                    )}
                    <span className="text-white text-sm font-medium flex items-center">
                      View Brand
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                {/* Brand Name (Below Card) */}
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-medium text-charcoal-900 group-hover:text-forest-600 transition-colors">
                    {store.name}
                  </h3>
                  {store.product_count !== undefined && store.product_count > 0 && (
                    <p className="text-xs text-charcoal-500 mt-1">
                      {store.product_count} products
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="inline-block">
            <h3 className="text-2xl font-bold text-charcoal-900 mb-3">Want to showcase your brand?</h3>
            <p className="text-charcoal-600 mb-6">Join our curated collection of outdoor makers</p>
            <Link
              to="/apply-to-sell"
              className="inline-flex items-center px-8 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-colors"
            >
              Apply to Sell
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}