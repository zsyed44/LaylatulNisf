import { useState, useEffect } from 'react';
import { getAllRegistrations } from '../api';
import type { Registration } from '../types';

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedInIds, setCheckedInIds] = useState<Set<number>>(new Set());

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/?admin=true';
  };

  useEffect(() => {
    // Load checked-in IDs from localStorage first
    const savedCheckedIn = localStorage.getItem('checkedInIds');
    if (savedCheckedIn) {
      try {
        const ids = JSON.parse(savedCheckedIn);
        setCheckedInIds(new Set(ids));
      } catch (e) {
        console.error('Error loading checked-in IDs:', e);
      }
    }
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllRegistrations();
      setRegistrations(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load registrations');
      console.error('Error loading registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge checked-in state with registrations for display
  const registrationsWithCheckIn = registrations.map((reg) => ({
    ...reg,
    checkedIn: checkedInIds.has(reg.id),
  }));

  // Filter and search registrations
  const filteredRegistrations = registrationsWithCheckIn.filter((reg) => {
    // Status filter
    if (filter !== 'all' && reg.status !== filter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        reg.name.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        (reg.phone && reg.phone.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: registrations.length,
    paid: registrations.filter((r) => r.status === 'paid').length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    checkedIn: checkedInIds.size,
    totalTickets: registrations.reduce((sum, r) => sum + r.qty, 0),
    totalRevenue: registrations
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.qty * 45, 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCheckInToggle = (registration: Registration) => {
    const newCheckedInIds = new Set(checkedInIds);
    if (checkedInIds.has(registration.id)) {
      newCheckedInIds.delete(registration.id);
    } else {
      newCheckedInIds.add(registration.id);
    }
    setCheckedInIds(newCheckedInIds);
    // Save to localStorage
    localStorage.setItem('checkedInIds', JSON.stringify(Array.from(newCheckedInIds)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-serif font-bold text-neutral-900">Admin Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={loadRegistrations}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <a
            href="/"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-medium"
          >
            ← Back to Event Page
          </a>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="text-sm text-neutral-600 mb-1">Total Registrations</div>
            <div className="text-3xl font-bold text-neutral-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <div className="text-sm text-green-700 mb-1">Paid</div>
            <div className="text-3xl font-bold text-green-800">{stats.paid}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <div className="text-sm text-yellow-700 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg shadow p-6 border border-emerald-200">
            <div className="text-sm text-emerald-700 mb-1">Checked In</div>
            <div className="text-3xl font-bold text-emerald-800">{stats.checkedIn}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <div className="text-sm text-blue-700 mb-1">Total Tickets</div>
            <div className="text-3xl font-bold text-blue-800">{stats.totalTickets}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6 border border-purple-200">
            <div className="text-sm text-purple-700 mb-1">Revenue</div>
            <div className="text-3xl font-bold text-purple-800">${stats.totalRevenue.toFixed(2)} CAD</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-neutral-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'paid' | 'pending')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Dietary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-neutral-500">
                      {searchTerm || filter !== 'all'
                        ? 'No registrations match your filters'
                        : 'No registrations found'}
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className={`hover:bg-neutral-50 ${reg.checkedIn ? 'bg-green-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={reg.checkedIn || false}
                          onChange={() => handleCheckInToggle(reg)}
                          className="w-5 h-5 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        #{reg.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {reg.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {reg.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {reg.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {reg.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reg.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        ${(reg.qty * 45).toFixed(2)} CAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                        {reg.dietary || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-6 text-sm text-neutral-600">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>
        )}
      </div>
    </div>
  );
}

