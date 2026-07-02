
import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

function FinalCTA({ onGetStarted }) {
  return (
    <section className="bg-navy-950 py-20 relative overflow-hidden border-t border-gray-900">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
          <Sparkles size={12} /> Start Tracking For Free
        </span>

        <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight mb-4">
          Start Your Investment Journey Today
        </h2>

        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Join thousands of smart investors analyzing layouts, tracking asset allocations, and leveling up their market skills with Nivesh Academy.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
          >
            Create Free Account <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;