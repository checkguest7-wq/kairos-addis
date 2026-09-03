import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Review } from '../types';

interface CustomerReviewsSectionProps {
  reviews: Review[];
}

export function CustomerReviewsSection({ reviews }: CustomerReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="reviews" className="relative py-24 bg-transparent overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
            CUSTOMER REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 uppercase">
            TRUSTED BY OUR CUSTOMERS
          </h2>
        </div>

        {/* Carousel Container with Arrow Controls */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            id="reviews-prev-btn"
            aria-label="Previous Review"
            className="hidden xl:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 items-center justify-center transition-all duration-200 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            id="reviews-next-btn"
            aria-label="Next Review"
            className="hidden xl:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 items-center justify-center transition-all duration-200 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                id={`review-card-${review.id}`}
                className="relative rounded-2xl bg-gradient-to-b from-[#0c1424]/80 to-[#080d17]/90 border border-slate-800/90 p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-slate-700 hover:bg-[#0e172a] transition-all duration-300 shadow-xl backdrop-blur-sm"
              >
                {/* Customer Photo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                  <img
                    src={review.image}
                    alt={review.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Testimonial Text & Metadata */}
                <div className="flex-1 flex flex-col justify-between h-full">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-2.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed mb-4 line-clamp-4">
                    &ldquo;{review.quote}&rdquo;
                  </p>

                  {/* Name & Title */}
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      {review.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium truncate">
                      {review.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-6 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
