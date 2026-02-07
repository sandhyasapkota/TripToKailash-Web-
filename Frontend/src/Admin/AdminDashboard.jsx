import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useToast } from '../contexts/ToastContext';
import PageTransition from '../components/PageTransition';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function AdminDashboard() {
  const { showError } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
    totalEquipment: 0,
    totalRevenue: 0,
    totalReviews: 0,
    pendingReviews: 0,
    bookingStats: { pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
    recentBookings: [],
    recentUsers: [],
    monthlyStats: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.status === 401) {
          showError('Your admin session has expired. Please login again to continue.', 'Session Expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => window.location.href = '/login', 1500);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Doughnut chart for counts (Users, Bookings, Packages)
  const countChartData = {
    labels: ['Users', 'Bookings', 'Packages', 'Equipment'],
    datasets: [
      {
        data: [stats.totalUsers, stats.totalBookings, stats.totalPackages, stats.totalEquipment || 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  // Booking Status Pie Chart
  const bookingStatusData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.bookingStats?.pending || 0,
          stats.bookingStats?.confirmed || 0,
          stats.bookingStats?.completed || 0,
          stats.bookingStats?.cancelled || 0
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const bookingStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: { 
        display: true, 
        text: 'Booking Status Distribution',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 15 }
      }
    },
    cutout: '55%'
  };

  const countChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: { 
        display: true, 
        text: 'Distribution Overview',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      }
    },
    cutout: '60%'
  };

  // Generate last 6 months dynamically
  const getLastSixMonths = () => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }
    return months;
  };
  
  // Get months from API data or fallback to generated
  const months = stats.monthlyStats?.length > 0 
    ? stats.monthlyStats.map(m => m.month)
    : getLastSixMonths();
  
  // Get actual revenue data from API
  const getRevenueData = () => {
    if (stats.monthlyStats?.length > 0) {
      return stats.monthlyStats.map(m => m.revenue || 0);
    }
    // Fallback if no monthly data
    return [0, 0, 0, 0, 0, 0];
  };

  // Get actual booking data from API
  const getBookingData = () => {
    if (stats.monthlyStats?.length > 0) {
      return stats.monthlyStats.map(m => m.bookings || 0);
    }
    // Fallback if no monthly data
    return [0, 0, 0, 0, 0, 0];
  };

  // Get actual user registration data from API
  const getUserData = () => {
    if (stats.monthlyStats?.length > 0) {
      return stats.monthlyStats.map(m => m.users || 0);
    }
    // Fallback if no monthly data
    return [0, 0, 0, 0, 0, 0];
  };
  
  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue (Nrs.)',
        data: getRevenueData(),
        fill: true,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: { 
        display: true, 
        text: 'Revenue Trend',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 10 }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return 'Nrs. ' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Bar chart for users and bookings
  const userBookingChartData = {
    labels: ['Users & Bookings'],
    datasets: [
      {
        label: 'Total Users',
        data: [stats.totalUsers],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Total Bookings',
        data: [stats.totalBookings],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  const userBookingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: { 
        display: true, 
        text: 'User & Booking Overview',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 10 }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Line chart for bookings trend
  const bookingsChartData = {
    labels: months,
    datasets: [
      {
        label: 'Bookings',
        data: getBookingData(),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4
      },
      {
        label: 'New Users',
        data: getUserData(),
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4
      }
    ]
  };

  const bookingsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: { 
        display: true, 
        text: 'Booking Trend',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 10 }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Admin Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-indigo-200 text-xs sm:text-sm">Welcome back! Here's your platform overview</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="group bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-blue-200 text-xs mt-1">Active members</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                <p className="text-emerald-200 text-xs mt-1">Confirmed trips</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-violet-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium mb-1">Total Packages</p>
                <p className="text-3xl font-bold text-white">{stats.totalPackages}</p>
                <p className="text-violet-200 text-xs mt-1">Available tours</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">Nrs. {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-amber-200 text-xs mt-1">Monthly earnings</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-white">{stats.totalReviews}</p>
                <p className="text-teal-200 text-xs mt-1">Customer feedback</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-white">{stats.pendingReviews}</p>
                <p className="text-rose-200 text-xs mt-1">Awaiting approval</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Management Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Link to="/admin/users" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Manage Users</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">View, edit, and manage user accounts and permissions</p>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                <span>Access Panel</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/packages" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Manage Packages</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Create, edit, and organize tour packages</p>
              <div className="mt-4 flex items-center text-purple-600 font-medium">
                <span>Package Hub</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/bookings" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Manage Bookings</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Track and manage all customer bookings</p>
              <div className="mt-4 flex items-center text-emerald-600 font-medium">
                <span>Booking Center</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/reviews" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors">Manage Reviews</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Moderate and manage customer reviews</p>
              <div className="mt-4 flex items-center text-amber-600 font-medium">
                <span>Review Panel</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/equipment" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-slate-500 to-slate-700 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-slate-600 transition-colors">Manage Equipment</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Add and manage trekking equipment products</p>
              <div className="mt-4 flex items-center text-slate-600 font-medium">
                <span>Equipment Store</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/equipment-purchases" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Equipment Requests</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Approve and manage equipment purchase requests</p>
              <div className="mt-4 flex items-center text-orange-600 font-medium">
                <span>Request Queue</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/admin/messages" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">Contact Messages</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">View and respond to customer inquiries</p>
              <div className="mt-4 flex items-center text-teal-600 font-medium">
                <span>Message Inbox</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Visit User Pages Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visit User Pages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Home</h3>
              </div>
            </Link>

            <Link to="/packages" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Packages</h3>
              </div>
            </Link>

            <Link to="/equipment" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Equipment</h3>
              </div>
            </Link>

            <Link to="/about" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">About</h3>
              </div>
            </Link>

            <Link to="/services" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Services</h3>
              </div>
            </Link>

            <Link to="/contact" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">Contact</h3>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics Dashboard
          </h2>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="h-80 mb-6">
                <Doughnut data={countChartData} options={countChartOptions} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600 mb-1">{stats.totalUsers}</p>
                  <p className="text-sm text-blue-700 font-medium">Users</p>
                  <p className="text-xs text-blue-500 mt-1">Active members</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl text-center border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-600 mb-1">{stats.totalBookings}</p>
                  <p className="text-sm text-emerald-700 font-medium">Bookings</p>
                  <p className="text-xs text-emerald-500 mt-1">Confirmed trips</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                  <p className="text-2xl font-bold text-purple-600 mb-1">{stats.totalPackages}</p>
                  <p className="text-sm text-purple-700 font-medium">Packages</p>
                  <p className="text-xs text-purple-500 mt-1">Available tours</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="h-80 mb-6">
                <Line data={revenueChartData} options={revenueChartOptions} />
              </div>
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 p-6 rounded-xl text-center border border-amber-200">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-700 font-medium">Total Revenue</p>
                </div>
                <p className="text-4xl font-bold text-amber-600">Nrs. {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-amber-600 text-sm mt-2">Monthly earnings overview</p>
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="h-80 mb-6">
                <Bar data={userBookingChartData} options={userBookingChartOptions} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600 mb-1">{stats.totalUsers}</p>
                  <p className="text-sm text-blue-700 font-medium">Total Users</p>
                  <p className="text-xs text-blue-500 mt-1">Platform members</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl text-center border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-600 mb-1">{stats.totalBookings}</p>
                  <p className="text-sm text-emerald-700 font-medium">Total Bookings</p>
                  <p className="text-xs text-emerald-500 mt-1">All reservations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="h-80 mb-6">
                <Doughnut data={bookingStatusData} options={bookingStatusOptions} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                  <p className="text-xl font-bold text-yellow-600">{stats.bookingStats?.pending || 0}</p>
                  <p className="text-xs text-yellow-700">Pending</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-xl font-bold text-green-600">{stats.bookingStats?.confirmed || 0}</p>
                  <p className="text-xs text-green-700">Confirmed</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                  <p className="text-xl font-bold text-blue-600">{stats.bookingStats?.completed || 0}</p>
                  <p className="text-xs text-blue-700">Completed</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
                  <p className="text-xl font-bold text-red-600">{stats.bookingStats?.cancelled || 0}</p>
                  <p className="text-xs text-red-700">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Recent Bookings
                </h3>
                <Link to="/admin/bookings" className="text-sm text-[#2B4C8F] hover:underline font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {stats.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking, index) => (
                    <div key={booking.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {booking.User?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{booking.User?.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{booking.Product?.name || 'Package'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Recent Users
                </h3>
                <Link to="/admin/users" className="text-sm text-[#2B4C8F] hover:underline font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {stats.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user, index) => (
                    <div key={user.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm text-gray-700 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p>No recent users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export default AdminDashboard;
