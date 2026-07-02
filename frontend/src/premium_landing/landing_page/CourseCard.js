import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

export default function CourseCard({ course }) {
  return (
    <div className="bg-navy-950/80 border border-gray-850 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase">{course.tag}</span>
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Clock size={12} /> {course.time}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-200">{course.title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mt-2.5">{course.desc}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-800/60 flex justify-between items-center text-xs">
        <span className="text-gray-500 font-medium">{course.students} students enrolled</span>
        <button className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
          Start <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
