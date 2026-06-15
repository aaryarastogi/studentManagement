import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GraduationCap, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import StudentDetails from './components/StudentDetails';

const API_BASE_URL = 'http://localhost:5001';

const COURSES = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Biotechnology'
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'directory'

  // Student Registry List State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [filters, setFilters] = useState({ search: '', course: '', year: '', gender: '' });

  // Analytics State
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modal / Selection State
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // Null = Add, Student Object = Edit
  const [selectedStudent, setSelectedStudent] = useState(null); // Drawer detailed view
  const [studentToDelete, setStudentToDelete] = useState(null); // Confirmation delete modal
  const [submittingForm, setSubmittingForm] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3500);
  };

  // Fetch Student List from API
  const fetchStudents = async (targetPage = pagination.page, currentFilters = filters) => {
    setLoadingStudents(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(targetPage),
        limit: String(pagination.limit),
        search: currentFilters.search,
        course: currentFilters.course,
        year: currentFilters.year,
        gender: currentFilters.gender
      });

      const response = await fetch(`${API_BASE_URL}/students?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setStudents(result.data);
        setPagination(result.pagination);
      } else {
        showToast(result.message || 'Failed to fetch student registry', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error: Failed to connect to server.', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch Analytics & Logs from API
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/analytics`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsStats(result.data);
      } else {
        showToast('Failed to sync administrative stats', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error: Database stats out of sync.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchAnalytics();
    fetchStudents(1);
  }, []);

  // Fetch students on filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchStudents(1, newFilters);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchStudents(newPage);
  };

  // Sync all data
  const handleSyncData = () => {
    fetchAnalytics();
    fetchStudents(pagination.page);
    showToast('Registry database synchronized successfully.');
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (formData) => {
    setSubmittingForm(true);
    try {
      const isEdit = !!editingStudent;
      const url = isEdit ? `${API_BASE_URL}/students/${editingStudent.id}` : `${API_BASE_URL}/students`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData, // Send raw FormData
      });

      const result = await response.json();

      if (response.status === 420) {
        // Validation failed
        throw { response: { data: result } };
      }

      if (result.success) {
        showToast(result.message || (isEdit ? 'Student record modified.' : 'Student registered successfully.'));
        setFormOpen(false);
        setEditingStudent(null);
        // Refresh registry
        fetchStudents(1);
        fetchAnalytics();
      } else {
        showToast(result.message || 'Submission failed.', 'error');
      }
    } catch (err) {
      // Re-throw so form component can handle inner display errors
      throw err;
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle Deletion Confirmation
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        showToast(`Dropped student ${studentToDelete.name} from registry.`);
        setStudentToDelete(null);
        // Reset page if we delete the last item on the page
        const newPage = students.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
        fetchStudents(newPage);
        fetchAnalytics();
      } else {
        showToast(result.message || 'Failed to delete student record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during drop request.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* Top Glassmorphic Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-wider font-mono">EDU<span className="text-indigo-400">VAULT</span></span>
              <span className="hidden sm:inline-block bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20 rounded px-1.5 py-0.5 ml-2.5 uppercase tracking-wide">Manager</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-950/60 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Student Registry</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Content Body */}
      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex-1">
        {activeTab === 'dashboard' ? (
          <AnalyticsDashboard
            stats={analyticsStats}
            onRefresh={handleSyncData}
            loading={loadingAnalytics || loadingStudents}
          />
        ) : (
          <StudentTable
            students={students}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onAddClick={() => {
              setEditingStudent(null);
              setFormOpen(true);
            }}
            onEditClick={(student) => {
              setEditingStudent(student);
              setFormOpen(true);
            }}
            onViewClick={(student) => setSelectedStudent(student)}
            onDeleteClick={(student) => setStudentToDelete(student)}
            courses={COURSES}
            loading={loadingStudents}
            onRefresh={handleSyncData}
          />
        )}
      </main>

      {/* Register/Edit Form Modal */}
      <StudentForm
        student={editingStudent}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        courses={COURSES}
        submitting={submittingForm}
      />

      {/* Student Details Drawer Modal */}
      <StudentDetails
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onEditClick={(student) => {
          setEditingStudent(student);
          setFormOpen(true);
        }}
        onDeleteClick={(student) => setStudentToDelete(student)}
      />

      {/* Custom Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Drop Student Record?</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to drop <span className="font-semibold text-white">{studentToDelete.name}</span> ({studentToDelete.admission_number}) from the system?
                  <br />
                  This action is permanent and will delete the database record and profile image.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map(toast => {
          let icon = <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />;
          let containerClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
          
          if (toast.type === 'error') {
            icon = <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />;
            containerClass = 'bg-rose-500/10 border-rose-500/20 text-rose-300';
          } else if (toast.type === 'info') {
            icon = <Info className="h-5 w-5 text-cyan-400 shrink-0" />;
            containerClass = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300';
          }

          return (
            <div
              key={toast.id}
              className={`glass-panel border p-4 rounded-xl flex items-start gap-3 shadow-xl transition-all duration-300 animate-slide-up pointer-events-auto ${containerClass}`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold">{toast.message}</div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
