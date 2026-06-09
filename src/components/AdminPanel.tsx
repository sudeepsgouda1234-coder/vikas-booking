import React, { useState, useEffect } from 'react';
import {
  Calendar, Check, X, Search, Clock, FileSpreadsheet, Trash, 
  Settings, RefreshCw, BarChart2, PieChart as PieIcon, LogOut,
  CalendarDays, Plus, AlertCircle, Edit, DollarSign, IndianRupee
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Booking, BookingStats, Availability } from '../types';

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Stats state
  const [stats, setStats] = useState<BookingStats | null>(null);

  // Rescheduling modal state
  const [reschedulingBookingId, setReschedulingBookingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [isLoadingRescheduleSlots, setIsLoadingRescheduleSlots] = useState(false);
  const [isReschedulingSubmit, setIsReschedulingSubmit] = useState(false);

  // Availability planner state
  const [availDate, setAvailDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availSlots, setAvailSlots] = useState<string[]>(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [isSavingAvail, setIsSavingAvail] = useState(false);
  const [availMessage, setAvailMessage] = useState('');

  // Fetch bookings, stats, and custom availability
  const fetchAllAdminData = () => {
    setIsLoading(true);
    setErrorMessage('');

    // Fetch Bookings
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (filterDate) queryParams.append('date', filterDate);

    fetch(`/api/admin/bookings?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve bookings.');
        return res.json();
      })
      .then((data) => {
        setBookings(data);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Error loading bookings directory.');
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch Statistics
    fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error('Error computing metrics:', err));
  };

  // Re-fetch when searches or date filters adjust
  useEffect(() => {
    fetchAllAdminData();
  }, [searchQuery, filterDate]);

  // Load custom slots for availability planner when selected date adjustments occur
  useEffect(() => {
    if (!availDate) return;
    fetch(`/api/availability?date=${availDate}`)
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data && data.availableSlots) {
          setAvailSlots(data.availableSlots);
        } else {
          setAvailSlots(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']);
        }
      })
      .catch((err) => console.error('Error fetching planner slots:', err));
  }, [availDate]);

  // Fetch rescheduling slots when rescheduled date updates
  useEffect(() => {
    if (!rescheduleDate) return;
    setIsLoadingRescheduleSlots(true);
    fetch(`/api/availability?date=${rescheduleDate}`)
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data && data.availableSlots) {
          setRescheduleSlots(data.availableSlots);
          if (data.availableSlots.length > 0) {
            setRescheduleTime(data.availableSlots[0]);
          } else {
            setRescheduleTime('');
          }
        }
      })
      .finally(() => {
        setIsLoadingRescheduleSlots(false);
      });
  }, [rescheduleDate]);

  // Change Booking Status
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Could not update status');
      }

      // Refresh listings
      fetchAllAdminData();
    } catch (error) {
      alert('Status modification failed.');
    }
  };

  // Submit Reschedule Change
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBookingId || !rescheduleDate || !rescheduleTime) {
      alert('Provide date and time.');
      return;
    }

    setIsReschedulingSubmit(true);
    try {
      const response = await fetch(`/api/admin/bookings/${reschedulingBookingId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentDate: rescheduleDate,
          appointmentTime: rescheduleTime
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Reschedule failure.');
      }

      setReschedulingBookingId(null);
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsReschedulingSubmit(false);
    }
  };

  // Save Availability schedule
  const handleSaveAvailability = async () => {
    setIsSavingAvail(true);
    setAvailMessage('');
    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: availDate,
          availableSlots: availSlots
        })
      });

      if (!response.ok) throw new Error('Planner save failed');
      
      setAvailMessage('Availability schedule saved successfully!');
      setTimeout(() => setAvailMessage(''), 3000);
    } catch (error) {
      alert('Failed to save availability plan.');
    } finally {
      setIsSavingAvail(false);
    }
  };

  // Add a slot to availability planner list
  const handleAddPlannerSlot = () => {
    if (!newSlotInput) return;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Validate HH:MM
    if (!regex.test(newSlotInput)) {
      alert('Please enter a valid slot format, e.g. 14:30');
      return;
    }

    if (availSlots.includes(newSlotInput)) {
      alert('Slot already in planner grid.');
      return;
    }

    const updated = [...availSlots, newSlotInput].sort();
    setAvailSlots(updated);
    setNewSlotInput('');
  };

  const handleRemovePlannerSlot = (slot: string) => {
    setAvailSlots(availSlots.filter(s => s !== slot));
  };

  // Export Bookings to CSV File Dataset
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No database items loaded to compile CSV.');
      return;
    }

    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Service Type', 'Date', 'Time Slot', 'Status', 'Booking Created Date'];
    const rows = bookings.map(b => [
      b.id,
      b.customerName,
      b.email,
      b.phone,
      b.serviceType,
      b.appointmentDate,
      b.appointmentTime,
      b.status,
      b.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BookVikas_Schedules_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Mappings
  const chartServiceData = stats ? Object.keys(stats.bookingsByService).map(k => ({
    name: k.replace('1:1 Career & ', '').replace('Full-Stack ', ''), // Shorten labels
    Bookings: stats.bookingsByService[k]
  })) : [];

  const chartTimelineData = stats ? Object.keys(stats.bookingsByDate).map(k => ({
    date: k,
    Bookings: stats.bookingsByDate[k]
  })).sort((a,b) => a.date.localeCompare(b.date)) : [];

  const COLORS = ['#c5a059', '#8a6e3c', '#dfc38a', '#5f4d2f', '#a68c51'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-300">
      
      {/* Title block banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 rounded-[32px] bg-[#111113] text-white border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold/10 text-gold border border-gold/30 font-mono uppercase tracking-wider">
            PORTAL: ACTIVE
          </div>
          <h2 className="text-3xl font-extralight tracking-widest uppercase font-display">Vikas Admin Dashboard</h2>
          <p className="text-white/40 text-sm">Review consulting pipelines, manage slot schedules, alter dates, or check cash revenue.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={fetchAllAdminData}
            className="p-3 rounded-full bg-white/5 hover:bg-gold/15 hover:text-gold text-white/80 transition-all border border-white/10 cursor-pointer w-10 h-10 flex items-center justify-center"
            title="Refresh Registry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-gold hover:text-black font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </button>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="px-6 py-2.5 rounded-full bg-red-650/10 hover:bg-red-700/20 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Stats widgets columns */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="p-5 bg-[#111113] border border-white/10 rounded-2xl shadow-md">
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-widest mb-1">Total Bookings</span>
            <div className="flex items-baseline gap-2 mt-2">
              <strong className="text-2xl sm:text-3xl font-light text-white font-display">{stats.totalBookings}</strong>
              <span className="text-[9px] uppercase font-mono text-white/30">Sessions</span>
            </div>
          </div>

          <div className="p-5 bg-[#111113] border border-white/10 rounded-2xl shadow-md">
            <span className="text-[10px] text-gold font-bold block uppercase tracking-widest mb-1">Pending Review</span>
            <div className="flex items-baseline gap-2 mt-2">
              <strong className="text-2xl sm:text-3xl font-light text-gold font-display">{stats.pendingBookings}</strong>
              <span className="text-[9px] uppercase font-mono text-white/30">Action Needed</span>
            </div>
          </div>

          <div className="p-5 bg-[#111113] border border-white/10 rounded-2xl shadow-md">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-widest mb-1">Approved & Confirmed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <strong className="text-2xl sm:text-3xl font-light text-emerald-400 font-display">{stats.approvedBookings}</strong>
              <span className="text-[9px] uppercase font-mono text-white/30">Calendar</span>
            </div>
          </div>

          <div className="p-5 bg-[#111113] border border-white/10 rounded-2xl shadow-md">
            <span className="text-[10px] text-gold font-bold block uppercase tracking-widest mb-1">Secured Profits</span>
            <div className="flex items-baseline gap-2 mt-2">
              <strong className="text-2xl sm:text-3xl font-light text-gold font-display flex items-center">
                <IndianRupee className="h-5 w-5 mt-0.5 text-gold-dark mr-0.5" />
                {stats.totalRevenue.toLocaleString('en-IN')}
              </strong>
              <span className="text-[9px] uppercase font-mono text-white/30">INR</span>
            </div>
          </div>
        </div>
      )}

      {/* Recharts Analytics Division */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Bookings by date timeline */}
          <div className="bg-[#111113] p-6 rounded-2xl border border-white/10 shadow-md space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays className="h-4.5 w-4.5 text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(197,160,89,0.3))' }} />
              Scheduling Velocity
            </h3>
            <div className="h-64 mt-4 text-xs font-mono font-semibold">
              {chartTimelineData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20">No date statistics available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.03} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="Bookings" stroke="#c5a059" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Bookings by service bar */}
          <div className="bg-[#111113] p-6 rounded-2xl border border-white/10 shadow-md space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="h-4.5 w-4.5 text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(197,160,89,0.3))' }} />
              Advisory Volume by Service Type
            </h3>
            <div className="h-64 mt-4 text-xs font-mono font-semibold">
              {chartServiceData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20">No service division metrics recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartServiceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.03} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="Bookings" fill="#c5a059" radius={[6, 6, 0, 0]}>
                      {chartServiceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Scheduling Center (Split block: Bookings Catalog vs Slot Availability Manager) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side (8 cols): Bookings directory listing */}
        <div className="lg:col-span-8 bg-[#111113] rounded-[32px] border border-white/10 overflow-hidden space-y-6">
          <div className="p-6 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-white font-display">Active Scheduling Directory</h3>
              <p className="text-white/40 text-xs text-slate-500">Query schedules, approve bookings, cancel time sessions, or reschedule slots.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Query customer, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs border border-white/10 rounded-full bg-black/40 text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Date Filter Selection */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 text-xs border border-white/10 rounded-full bg-black/40 text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors"
              />

              {/* Reset date button */}
              {(filterDate || searchQuery) && (
                <button
                  onClick={() => { setFilterDate(''); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table list */}
          <div className="px-6 pb-6 overflow-x-auto max-h-160">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-white/40 font-mono text-sm">
                <div className="h-5 w-5 border-2 border-white/25 border-t-gold rounded-full animate-spin" />
                <span>Synchronizing database records...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 bg-black/20 rounded-2xl border border-dashed border-white/5 space-y-2">
                <Calendar className="h-10 w-10 text-white/10 mx-auto" />
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No active scheduling items resolved</p>
                <p className="text-xs text-white/30 max-w-xs mx-auto">Adjust search parameter queries or complete fresh customer bookings checkouts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-gold/30 transition-all space-y-4 animate-fade-in"
                  >
                    {/* Catalog item Header details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <strong className="text-white text-base select-all font-display">{booking.customerName}</strong>
                        <div className="text-xs text-white/60 flex flex-wrap gap-x-2.5 gap-y-1">
                          <span className="select-all">{booking.email}</span>
                          <span>•</span>
                          <span className="select-all">{booking.phone}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-white/30">ID: {booking.id}</span>
                        </div>
                      </div>

                      {/* Pill Badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit block tracking-widest border ${
                        booking.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        booking.status === 'pending' ? 'bg-gold/10 text-gold border-gold/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Booked Service metrics columns */}
                    <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-white/40 uppercase tracking-widest text-[9px] block mb-0.5">Selected Session</span>
                        <strong className="text-gold text-sm font-display">{booking.serviceType}</strong>
                      </div>
                      <div>
                        <span className="text-white/40 uppercase tracking-widest text-[9px] block mb-0.5">Scheduled Date</span>
                        <span className="text-white/80 flex items-center gap-1 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-gold" />
                          {booking.appointmentDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 uppercase tracking-widest text-[9px] block mb-0.5">Time Slot</span>
                        <span className="text-white/80 flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          {booking.appointmentTime}
                        </span>
                      </div>
                    </div>

                    {/* Private Agenda notes */}
                    {booking.notes && (
                      <p className="text-xs text-white/50 bg-black/40 p-3 rounded-lg border border-white/5 italic">
                        "{booking.notes}"
                      </p>
                    )}

                    {/* Operational controls footer (Approve/Reject actions) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                      
                      <button
                        onClick={() => {
                          setReschedulingBookingId(booking.id);
                          setRescheduleDate(booking.appointmentDate);
                          setRescheduleTime(booking.appointmentTime);
                        }}
                        className="px-4 py-2 rounded-full border border-white/10 hover:border-gold/30 hover:bg-white/5 text-white/80 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                        <Edit className="h-3.5 w-3.5 text-gold" />
                        Reschedule
                      </button>

                      <div className="flex gap-2">
                        {/* Reject status action */}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'rejected')}
                            className="border border-red-550/20 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}

                        {/* Approve Status Action */}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'approved')}
                            className="bg-white hover:bg-gold text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors shadow-lg active:scale-95"
                          >
                            <Check className="h-3.5 w-3.5 text-black" />
                            Approve
                          </button>
                        )}

                        {/* Cancel active scheduled item action */}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300 border border-red-500/10 hover:bg-red-500/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side (4 cols): Custom Availability scheduler planner */}
        <div className="lg:col-span-4 bg-[#111113] rounded-[32px] border border-white/10 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white font-display flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-gold animate-spin" style={{ animationDuration: '6s', filter: 'drop-shadow(0 0 5px rgba(197,160,89,0.3))' }} />
              Availability Grid Planner
            </h3>
            <p className="text-white/40 text-xs">Pick any date and declare your custom available booking slots.</p>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">Choose Planning Date</label>
            <input
              type="date"
              value={availDate}
              onChange={(e) => setAvailDate(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Open Slot interval grid toggle list */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">Planner Slots Grid ({availSlots.length} active)</label>
            
            {availSlots.length === 0 ? (
              <p className="p-3 bg-red-400/10 text-red-400 text-xs rounded-xl font-mono">No slots specified. Vikas is blocked/out of office on this date unless slots are custom added.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/5">
                {availSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold font-mono text-xs font-bold border border-gold/20 animate-fade-in"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlannerSlot(slot)}
                      className="text-red-400 hover:text-red-500 font-extrabold shrink-0 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add custom slot form */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">Add Open Booking Slot Interval</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 15:45"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                className="flex-grow pl-3 pr-2 py-2 placeholder-white/20 text-xs border border-white/10 rounded-lg bg-black/40 text-white focus:outline-none focus:border-gold font-mono"
              />
              <button
                type="button"
                onClick={handleAddPlannerSlot}
                className="px-4 py-2 text-xs bg-white text-black hover:bg-gold rounded-lg font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Slot
              </button>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-white/30">Use 24-hour HH:MM format parameters only.</p>
          </div>

          {/* Save Planner Grid Trigger */}
          <button
            type="button"
            onClick={handleSaveAvailability}
            disabled={isSavingAvail}
            className="w-full py-3.5 rounded-full bg-white text-black hover:bg-gold font-bold uppercase tracking-widest text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSavingAvail ? 'Archiving plan...' : 'Save Availability Schedule'}
          </button>

          {availMessage && (
            <div className="p-3 bg-[#111113] border border-gold/20 text-gold rounded-xl text-xs font-semibold text-center animate-fade-in font-mono">
              {availMessage}
            </div>
          )}
        </div>

      </div>

      {/* Rescheduling Modal dialog */}
      {reschedulingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111113] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
              <h3 className="font-extrabold text-lg text-white font-display">Reschedule Appointment</h3>
              <button
                onClick={() => setReschedulingBookingId(null)}
                className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-6">
              
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">Choose Reschedule Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]} // prevent past
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-white/10 rounded-xl bg-black/40 text-white focus:border-gold outline-none transition-colors"
                />
              </div>

              {/* Time Slots selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">
                  Select New Time Slot
                </label>
                
                {isLoadingRescheduleSlots ? (
                  <div className="flex gap-1.5 py-4 text-xs font-medium text-white/40">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
                    <span>Checking vacant slots...</span>
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="p-3 bg-red-400/10 text-red-500 text-xs rounded-xl font-mono">No slots vacant on this day. Please pick a different date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-36 pr-1">
                    {rescheduleSlots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRescheduleTime(s)}
                        className={`py-2 rounded-lg font-mono text-xs font-bold text-center border transition-all ${
                          rescheduleTime === s
                            ? 'bg-gold border-gold text-black font-extrabold font-mono'
                            : 'bg-black/40 border-white/10 hover:border-white/30 text-white font-mono'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal controls */}
              <div className="flex gap-3 pt-4 border-t border-white/5 justify-end">
                <button
                  type="button"
                  onClick={() => setReschedulingBookingId(null)}
                  className="px-6 py-2.5 text-xs font-bold rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReschedulingSubmit || !rescheduleTime}
                  className="px-6 py-2.5 text-xs font-bold rounded-full bg-white hover:bg-gold text-black transition-all disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                >
                  {isReschedulingSubmit ? 'Updating...' : 'Reschedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
