import { useState, FormEvent } from 'react';
import { X, Phone, Mail, MapPin, Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  carName?: string;
}

export function ContactModal({ isOpen, onClose, carName }: ContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    carName ? `Hello Kairos Addis, I am interested in inquiring about the ${carName}. Please contact me with duty-free pricing and availability.` : ''
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-6 text-slate-200">
        
        {/* Top Glowing Highlight */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="modal-close-contact"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-900/60 border border-blue-500 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(37,99,235,0.4)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              Message Received!
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
              Thank you for reaching out, <span className="text-white font-semibold">{name || 'valued customer'}</span>. A Kairos Addis automotive advisor will reach out to you within 2 hours.
            </p>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-sm tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.5)] cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
                DIRECT SHOWROOM INQUIRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
                CONTACT <span className="text-blue-500">KAIROS ADDIS</span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {carName ? `Direct consultation for ${carName}` : 'Get in touch with our EV advisors in Addis Ababa.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Direct Channels Info */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1 text-xs font-bold uppercase">
                    <Phone className="w-4 h-4" />
                    <span>Showroom Hotline</span>
                  </div>
                  <div className="text-sm font-bold text-white">+251 911 00 00 00</div>
                  <div className="text-[11px] text-slate-400">+251 922 00 00 00 (WhatsApp)</div>
                </div>

                <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1 text-xs font-bold uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">
                    Bole Medhanialem, Premium EV Showroom & Service Center, Addis Ababa, Ethiopia
                  </div>
                </div>

                <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1 text-xs font-bold uppercase">
                    <Clock className="w-4 h-4" />
                    <span>Working Hours</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Monday - Saturday: 8:30 AM – 7:00 PM<br />
                    Sunday: 10:00 AM – 4:00 PM
                  </div>
                </div>
              </div>

              {/* Right Inquiry Form */}
              <form onSubmit={handleSubmit} className="md:col-span-7 space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Abebe Kebede"
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 9..."
                      className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="abebe@example.com"
                      className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Message / Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your requirements, duty-free status, or delivery timeline..."
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-contact-form"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-sm transition-all duration-200 tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
