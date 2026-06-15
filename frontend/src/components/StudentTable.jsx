import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';

export default function StudentTable({
  students,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onViewClick,
  onDeleteClick,
  courses,
  loading,
  onRefresh,
  apiBaseUrl
}) {
  const { total = 0, page = 1, limit = 10, pages = 1 } = pagination || {};
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput });
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleSelectFilter = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    onFilterChange({ search: '', course: '', year: '', gender: '' });
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
    <div className="space-y-6 animate-fade-in">
      {/* Title Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Student Registry
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Manage, filter, and track student profiles across all academic fields.</p>
        </div>
        <button
          onClick={onAddClick}
          className="glow-btn bg-indigo-600 text-white font-medium px-5 py-3 rounded-xl hover:bg-indigo-500 hover:shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm w-fit shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Register Student
        </button>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or admission number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Filters dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Filter by Course */}
            <select
              value={filters.course}
              onChange={(e) => handleSelectFilter('course', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            {/* Filter by Year */}
            <select
              value={filters.year}
              onChange={(e) => handleSelectFilter('year', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all cursor-pointer"
            >
              <option value="">All Academic Years</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
            </select>

            {/* Filter by Gender */}
            <select
              value={filters.gender}
              onChange={(e) => handleSelectFilter('gender', e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all cursor-pointer"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

          </div>

          {/* Reset Filters and Refresh buttons */}
          <div className="flex gap-2">
            {(filters.search || filters.course || filters.year || filters.gender) && (
              <button
                onClick={handleResetFilters}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl border border-slate-700/60 font-semibold cursor-pointer transition-all flex-1 lg:flex-initial"
              >
                Clear
              </button>
            )}
            <button
              onClick={onRefresh}
              className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="Refresh list"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Student List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold tracking-wider text-slate-400 uppercase select-none">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Course Dept</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-800 rounded" />
                        <div className="h-3 w-20 bg-slate-800 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-12 bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 bg-slate-800 rounded" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="h-8 w-24 bg-slate-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-12 w-12 text-slate-700 mb-3" />
                      <p className="font-bold text-slate-400 text-base">No Student Records Found</p>
                      <p className="text-xs text-slate-500 max-w-[280px] mt-1 leading-relaxed">
                        Try refining your filters, clearing the search query, or add a new student.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    {/* Student Info (Avatar + Name & Gender) */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {student.photo_path ? (
                          <img
                            src={`${apiBaseUrl}/${student.photo_path}`}
                            alt={student.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-700"
                            onError={(e) => {
                              // If image fails to load, fallback to avatar background
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-10 w-10 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${getAvatarBg(student.id)}`}
                          style={{ display: student.photo_path ? 'none' : 'flex' }}
                        >
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{student.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{student.gender}</p>
                        </div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">
                        {student.admission_number}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-slate-300 font-medium">{student.course}</p>
                    </td>

                    {/* Year */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-slate-400">
                      <span className="bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded text-xs">
                        Yr {student.year}
                      </span>
                    </td>

                    {/* Contact (Email & Mobile) */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-slate-300 font-medium">{student.email}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{student.mobile_number}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewClick(student)}
                          className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditClick(student)}
                          className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(student)}
                          className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-400">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-400">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-semibold text-slate-400">{total}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: pages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Simple display logic: show current, first, last, and neighbors if pages are many.
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`h-8 min-w-8 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border border-indigo-500'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pages}
                className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
