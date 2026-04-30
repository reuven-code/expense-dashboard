import React, { useEffect, useState } from 'react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export function AppointmentsList() {
  const { t } = useLanguage();
  const { filteredAppointments, setAppointments, loading, setLoading, error, setError } =
    useAppointmentStore();

  const [businessId] = useState('default-business'); // TODO: Get from auth
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const params = dateFilter ? { date: dateFilter } : undefined;
        const appointments = await apiClient.getAppointments(businessId, params);
        setAppointments(appointments);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [businessId, dateFilter, setAppointments, setLoading, setError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'eeee, d MMMM', { locale: he });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{t('message.loading')}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.appointments')}</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          {t('button.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setDateFilter('')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {t('button.cancel')}
        </button>
      </div>

      {/* Table */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {t('message.no_data')}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.date')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.time')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.customer')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.phone')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.service')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.status')}</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-gray-900">{formatDate(appt.date)}</td>
                  <td className="px-6 py-3 text-gray-900">{appt.time}</td>
                  <td className="px-6 py-3 text-gray-900">{appt.customerName}</td>
                  <td className="px-6 py-3 text-gray-900">{appt.customerPhone}</td>
                  <td className="px-6 py-3 text-gray-900">{appt.service}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appt.status)}`}>
                      {t(`status.${appt.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                      {t('button.edit')}
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-semibold">
                      {t('button.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
