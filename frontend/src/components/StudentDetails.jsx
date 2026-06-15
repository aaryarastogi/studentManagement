import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, Edit, Trash2, ShieldAlert } from 'lucide-react';

export default function StudentDetails({ student, isOpen, onClose, onEditClick, onDeleteClick, apiBaseUrl }) {
  if (!isOpen || !student) return null;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Colorful avatar generator
  const getAvatarBg = (id) => {
    const colors = [
      'bg-indigo-600/30 text-indigo-300 border-indigo-500/30',
      'bg-purple-600/30 text-purple-300 border-purple-500/30',
      'bg-cyan-600/30 text-cyan-300 border-cyan-500/30',
      'bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
      'bg-amber-600/30 text-amber-300 border-amber-500/30',
      'bg-rose-600/30 text-rose-300 border-rose-500/30'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      
      {/* Modal Drawer */}
      <div className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl relative flex flex-col my-8 animate-slide-up max-h-[90vh]">
        
        {/* Decorative Top Accent */}
        <div className="h-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

        {/* Close button absolute */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-lg bg-slate-950/40 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Profile Card Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Header ID Card section */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800/60">
            {/* Student Photo */}
            <div className="relative h-28 w-28 rounded-full border-2 border-indigo-500/40 bg-slate-900 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
              {student.photo_path ? (
                <img
                  src={`${apiBaseUrl}/${student.photo_path}`}
                  alt={student.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`h-full w-full flex items-center justify-center text-2xl font-bold font-mono ${getAvatarBg(student.id)}`}
                style={{ display: student.photo_path ? 'none' : 'flex' }}
              >
                {getInitials(student.name)}
              </div>
            </div>

            {/* Name and Admission Code */}
            <h3 className="text-2xl font-bold text-white tracking-tight">{student.name}</h3>
            <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mt-2">
              ID: {student.admission_number}
            </span>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            
            {/* Academic Field */}
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Department</p>
                <p className="text-slate-300 font-medium mt-0.5">{student.course}</p>
              </div>
            </div>

            {/* Academic Level */}
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl">
              <GraduationCap className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Academic Year</p>
                <p className="text-slate-300 font-medium mt-0.5">Year {student.year} (Level {student.year})</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl">
              <Calendar className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Date of Birth</p>
                <p className="text-slate-300 font-medium mt-0.5">{formatDate(student.dob)}</p>
              </div>
            </div>

            {/* Mobile Contact */}
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl">
              <Phone className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Mobile Phone</p>
                <p className="text-slate-300 font-medium mt-0.5">{student.mobile_number}</p>
              </div>
            </div>

          </div>

          {/* Email Address (full width) */}
          <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl text-sm">
            <Mail className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="w-full truncate">
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Email Address</p>
              <p className="text-slate-300 font-medium mt-0.5 truncate">{student.email}</p>
            </div>
          </div>

          {/* Address (full width) */}
          <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/30 p-3.5 rounded-xl text-sm">
            <MapPin className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Residential Address</p>
              <p className="text-slate-300 font-medium mt-0.5 leading-relaxed">{student.address}</p>
            </div>
          </div>

          {/* Footnotes: enrollment timestamp */}
          <p className="text-[10px] text-slate-500 text-center font-mono select-none pt-2">
            Record registered on {new Date(student.created_at).toLocaleString()}
          </p>

          {/* Controls Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800/60 mt-6">
            <button
              onClick={() => {
                onClose();
                onEditClick(student);
              }}
              className="bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Profile
            </button>
            <button
              onClick={() => {
                onClose();
                onDeleteClick(student);
              }}
              className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Drop Student
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
