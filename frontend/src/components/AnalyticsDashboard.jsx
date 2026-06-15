import React from 'react';
import { Users, BookOpen, GraduationCap, Clock, RefreshCw } from 'lucide-react';

export default function AnalyticsDashboard({ stats, onRefresh, loading }) {
  const {
    totalStudents = 0,
    courseDistribution = [],
    yearDistribution = [],
    genderDistribution = [],
    activityLogs = []
  } = stats || {};

  // Find dominant course
  const topCourse = courseDistribution.length > 0 ? courseDistribution[0].course : 'N/A';
  const topCourseCount = courseDistribution.length > 0 ? courseDistribution[0].count : 0;

  // Calculate gender percentages
  const totalGenderCount = genderDistribution.reduce((acc, curr) => acc + curr.count, 0);
  const maleCount = genderDistribution.find(g => g.gender === 'Male')?.count || 0;
  const femaleCount = genderDistribution.find(g => g.gender === 'Female')?.count || 0;
  const otherCount = genderDistribution.find(g => g.gender === 'Other')?.count || 0;

  const malePct = totalGenderCount > 0 ? Math.round((maleCount / totalGenderCount) * 100) : 0;
  const femalePct = totalGenderCount > 0 ? Math.round((femaleCount / totalGenderCount) * 100) : 0;
  const otherPct = totalGenderCount > 0 ? Math.round((otherCount / totalGenderCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with refresh button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Real-time statistics and administrative activity logs.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-600/35 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Syncing...' : 'Sync Analytics'}
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-3xl font-bold text-white mt-2">{totalStudents}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>+100% system active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Top Department</p>
              <h3 className="text-xl font-bold text-white mt-2 truncate max-w-[170px]" title={topCourse}>
                {topCourseCount > 0 ? topCourse.split(' ')[0] : 'N/A'}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-purple-300 font-medium">
            {topCourseCount} Active Student{topCourseCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Academic Years</p>
              <h3 className="text-3xl font-bold text-white mt-2">{yearDistribution.length} Levels</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-cyan-300 font-medium">
            Years 1 to {yearDistribution.reduce((max, y) => y.year > max ? y.year : max, 4)}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-rose-600/10 rounded-full blur-2xl group-hover:bg-rose-600/20 transition-all duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Gender Balance</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {malePct}% <span className="text-slate-500 text-sm">M</span> · {femalePct}% <span className="text-slate-500 text-sm">F</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-rose-300 font-medium">
            {otherCount > 0 ? `${otherCount} Other gender registered` : 'Binary parity index'}
          </div>
        </div>
      </div>

      {/* Analytics Details (Grids of Distribution & Activity Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Course Distribution Table */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Course Enrollment Breakdown</h3>
            {courseDistribution.length === 0 ? (
              <p className="text-slate-400 text-sm">No courses recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {courseDistribution.map((item, idx) => {
                  const percent = totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0;
                  // Alternate progress bar colors
                  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-blue-500'];
                  const colorClass = colors[idx % colors.length];
                  
                  return (
                    <div key={item.course} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium truncate max-w-[80%]">{item.course}</span>
                        <span className="text-slate-400 font-semibold">{item.count} students ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Year Distribution Progress */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Distribution by Academic Year</h3>
            {yearDistribution.length === 0 ? (
              <p className="text-slate-400 text-sm">No year statistics available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {yearDistribution.map((y) => {
                  const percent = totalStudents > 0 ? Math.round((y.count / totalStudents) * 100) : 0;
                  return (
                    <div key={y.year} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-center">
                      <p className="text-indigo-400 text-2xl font-bold">Year {y.year}</p>
                      <p className="text-slate-200 font-semibold mt-1 text-sm">{y.count} Student{y.count !== 1 ? 's' : ''}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{percent}% of total</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column (1/3 width) - Activity Logs */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Activity Logger
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-mono">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-1">
            {activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                <Clock className="h-8 w-8 mb-2 opacity-35" />
                <p className="text-sm">No activity logged yet.</p>
              </div>
            ) : (
              activityLogs.map((log) => {
                // Formatting timestamp
                const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const logDate = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                // Action badges
                let badgeClass = 'bg-slate-800 text-slate-400';
                if (log.action === 'CREATE') badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                if (log.action === 'UPDATE') badgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                if (log.action === 'DELETE') badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                if (log.action === 'SEED') badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                return (
                  <div key={log.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${badgeClass}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {logDate} at {logTime}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1.5 leading-relaxed font-sans">{log.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
