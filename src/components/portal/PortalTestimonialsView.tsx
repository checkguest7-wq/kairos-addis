import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  AlertCircle,
  Car,
} from 'lucide-react';
import { PortalTestimonial } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface PortalTestimonialsViewProps {
  testimonials: PortalTestimonial[];
  onRefresh: () => void;
}

export const PortalTestimonialsView: React.FC<PortalTestimonialsViewProps> = ({
  testimonials,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [vehicleModel, setVehicleModel] = useState('BYD Tang L (7-Seater EV)');
  const [testimonialText, setTestimonialText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialText.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.createTestimonial({
        rating,
        vehicleModel,
        text: testimonialText.trim(),
      });

      setSuccessMsg('Your testimonial has been submitted! It will appear publicly after approval by our review team.');
      setTestimonialText('');
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
          <Star className="w-3.5 h-3.5" />
          CUSTOMER FEEDBACK & REVIEWS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Share Your EV Experience
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Provide your feedback on vehicle performance, YouGuard warranty service, and Addis Ababa driving dynamics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Testimonial Form */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Write a Review</h3>
              <p className="text-xs text-slate-400">Your review helps future EV adopters in Ethiopia.</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Vehicle Model Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Vehicle Model
              </label>
              <select
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="BYD Tang L (7-Seater EV)">BYD Tang L (7-Seater EV)</option>
                <option value="Geely Galaxy E5 (Pure Electric)">Geely Galaxy E5 (Pure Electric)</option>
                <option value="Toyota bZ4X (Electric AWD)">Toyota bZ4X (Electric AWD)</option>
                <option value="General Kairos Addis Service Experience">General Kairos Addis Service Experience</option>
              </select>
            </div>

            {/* Testimonial Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Review & Experience
              </label>
              <textarea
                rows={4}
                required
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                placeholder="Share your driving range over Ethiopian hills, charging experience, YouGuard warranty peace of mind, or customer support..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* Verification Notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Moderation Notice:</strong> Testimonials are verified by our team prior to appearing publicly on our official website.
              </span>
            </div>

            <button
              id="btn-submit-testimonial"
              type="submit"
              disabled={isSubmitting || !testimonialText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Previous Submissions List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Your Submitted Reviews ({testimonials.length})
          </h3>

          {testimonials.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">You have not submitted any testimonials yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < t.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {t.status === 'APPROVED' ? 'Approved & Public' : 'Pending Review'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{t.text}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="font-semibold text-slate-400">{t.vehicleModel}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
