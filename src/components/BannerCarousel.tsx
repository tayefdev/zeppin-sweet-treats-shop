import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  banner_type: 'image' | 'video';
  banner_url: string;
  display_order: number;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoSlideInterval?: number;
}

export const BannerCarousel = ({ banners, autoSlideInterval = 10000 }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sort banners by display order
  const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);

  // Auto-slide functionality
  useEffect(() => {
    if (sortedBanners.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [currentIndex, sortedBanners.length, autoSlideInterval]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % sortedBanners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + sortedBanners.length) % sortedBanners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!sortedBanners || sortedBanners.length === 0) {
    return null;
  }

  const currentBanner = sortedBanners[currentIndex];

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-gray-900">
      {/* Banner Content */}
      <div className="relative w-full h-full">
        {sortedBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {banner.banner_type === 'video' ? (
              <video
                src={banner.banner_url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={banner.banner_url}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-20" />
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {sortedBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
            onClick={goToPrevious}
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
            onClick={goToNext}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {sortedBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-white w-8 h-2"
                    : "bg-white/50 hover:bg-white/75 w-2 h-2"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};