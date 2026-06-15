import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, ShieldAlert } from 'lucide-react';

export default function StudentForm({
  student, // If editing, this is populated. If adding, this is null.
  isOpen,
  onClose,
  onSubmit,
  courses,
  submitting,
  apiBaseUrl
}) {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    year: '1',
    dob: '',
    email: '',
    mobile_number: '',
    gender: 'Male',
    address: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  // Initialize form if editing
  useEffect(() => {
    if (student) {
      // Format date to YYYY-MM-DD for date input
      const formattedDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : '';
      setFormData({
        name: student.name || '',
        course: student.course || '',
        year: String(student.year || '1'),
        dob: formattedDob,
        email: student.email || '',
        mobile_number: student.mobile_number || '',
        gender: student.gender || 'Male',
        address: student.address || ''
      });
      if (student.photo_path) {
        setPhotoPreview(`${apiBaseUrl}/${student.photo_path}`);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
    } else {
      // Reset form if adding
      setFormData({
        name: '',
        course: '',
        year: '1',
        dob: '',
        email: '',
        mobile_number: '',
        gender: 'Male',
        address: ''
      });
      setPhotoPreview(null);
      setPhotoFile(null);
    }
    setErrors({});
    setSubmitError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }
      // File type validation
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'File must be an image (PNG, JPG, JPEG, WEBP)' }));
        return;
      }
      
      setPhotoFile(file);
      setErrors(prev => ({ ...prev, photo: null }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Client-side validations
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.course.trim()) newErrors.course = 'Course/Department selection is required';

    const yearNum = parseInt(formData.year);
    if (!formData.year || isNaN(yearNum) || yearNum < 1 || yearNum > 8) {
      newErrors.year = 'Year must be a number between 1 and 8';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dob = 'Date of birth must be in the past';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Enter a valid email address';

    const phoneRegex = /^[+0-9\s-]{10,15}$/;
    if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
    else if (!phoneRegex.test(formData.mobile_number.trim())) {
      newErrors.mobile_number = 'Enter a valid mobile number (10-15 digits)';
    }

    if (!formData.gender) newErrors.gender = 'Gender selection is required';

    if (!formData.address.trim()) newErrors.address = 'Contact address is required';
    else if (formData.address.trim().length < 5) newErrors.address = 'Address must be at least 5 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    // Build FormData for multipart upload
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    if (photoFile) {
      data.append('photo', photoFile);
    }

    try {
      await onSubmit(data);
    } catch (err) {
      console.error('Submission failed:', err);
      // Capture backend validation messages or general errors
      if (err.response && err.response.data) {
        const resData = err.response.data;
        if (resData.errors && Array.isArray(resData.errors)) {
          const backendErrors = {};
          resData.errors.forEach(errObj => {
            const field = Object.keys(errObj)[0];
            backendErrors[field] = errObj[field];
          });
          setErrors(backendErrors);
          setSubmitError('Please fix the validation errors below.');
        } else {
          setSubmitError(resData.message || 'An error occurred during submission.');
        }
      } else {
        setSubmitError('Failed to connect to the server. Please verify backend is running.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      
      {/* Modal Card */}
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col my-8 animate-slide-up max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {student ? 'Edit Student Details' : 'Register New Student'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {student ? `Modifying profile for ${student.admission_number}` : 'Capture comprehensive student record details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {submitError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Student Profile Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4.5 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
              
              {/* Photo Preview Thumbnail */}
              <div className="relative h-24 w-24 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-slate-600" />
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Select Image
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG, WEBP. Max size 5MB.</p>
                {errors.photo && <p className="text-rose-400 text-[11px] font-medium">{errors.photo}</p>}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Primary Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter first & last name"
                className={`w-full bg-slate-900 border ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
              />
              {errors.name && <p className="text-rose-400 text-[11px] font-medium">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student.name@example.com"
                className={`w-full bg-slate-900 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
              />
              {errors.email && <p className="text-rose-400 text-[11px] font-medium">{errors.email}</p>}
            </div>

            {/* Course Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Course / Department</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={`w-full bg-slate-900 border ${errors.course ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer`}
              >
                <option value="" disabled>Select Department</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
                {/* Fallback to custom entry if not in predefined list (e.g. for user custom inputs) */}
                {!courses.includes(formData.course) && formData.course && (
                  <option value={formData.course}>{formData.course}</option>
                )}
              </select>
              {errors.course && <p className="text-rose-400 text-[11px] font-medium">{errors.course}</p>}
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Academic Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full bg-slate-900 border ${errors.year ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer`}
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
                <option value="5">5th Year (Post-Grad)</option>
                <option value="6">6th Year</option>
                <option value="7">7th Year</option>
                <option value="8">8th Year (Ph.D. / Research)</option>
              </select>
              {errors.year && <p className="text-rose-400 text-[11px] font-medium">{errors.year}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full bg-slate-900 border ${errors.dob ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer`}
              />
              {errors.dob && <p className="text-rose-400 text-[11px] font-medium">{errors.dob}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Mobile Number</label>
              <input
                type="text"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="10-15 digit phone"
                className={`w-full bg-slate-900 border ${errors.mobile_number ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all`}
              />
              {errors.mobile_number && <p className="text-rose-400 text-[11px] font-medium">{errors.mobile_number}</p>}
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <label
                    key={g}
                    className={`flex items-center justify-center border rounded-xl py-2.5 text-xs font-semibold cursor-pointer transition-all select-none ${
                      formData.gender === g
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-rose-400 text-[11px] font-medium">{errors.gender}</p>}
            </div>

          </div>

          {/* Address textarea (full width) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Residential Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="House, Street, Area, City, State, ZIP..."
              className={`w-full bg-slate-900 border ${errors.address ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all resize-none`}
            />
            {errors.address && <p className="text-rose-400 text-[11px] font-medium">{errors.address}</p>}
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 font-semibold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="glow-btn bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : student ? 'Save Changes' : 'Submit Record'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
