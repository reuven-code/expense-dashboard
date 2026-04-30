import React, { useEffect, useState } from 'react';
import { useBusinessHoursStore } from '../stores/appointmentStore';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HEBREW_DAYS: Record<string, string> = {
  Monday: 'שני',
  Tuesday: 'שלישי',
  Wednesday: 'רביעי',
  Thursday: 'חמישי',
  Friday: 'שישי',
  Saturday: 'שבת',
  Sunday: 'ראשון',
};

export function BusinessHours() {
  const { t, dir } = useLanguage();
  const [businessId] = useState('default-business');
  const [hours, setHours] = useState<Record<string, DayHours> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getBusinessHours(businessId);
        setHours(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch business hours');
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, [businessId]);

  const handleDayChange = (day: string, field: string, value: string | boolean) => {
    setHours((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!hours) return;
    try {
      setSaving(true);
      await apiClient.updateBusinessHours(businessId, hours);
      setError(null);
      alert(t('success.updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to save business hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t('message.loading')}</div>;
  }

  if (!hours) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.hours')}</h1>
        <p className="text-gray-600 mt-2">קבע את שעות הפתיחה של העסק שלך</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Hours Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">יום</th>
              <th className="px-6 py-3 text-left font-semibold">סגור</th>
              <th className="px-6 py-3 text-left font-semibold">פתיחה</th>
              <th className="px-6 py-3 text-left font-semibold">סגירה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {DAYS.map((day) => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {HEBREW_DAYS[day]}
                </td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={hours[day]?.closed || false}
                    onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={hours[day]?.open || '09:00'}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    disabled={hours[day]?.closed}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={hours[day]?.close || '17:00'}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    disabled={hours[day]?.closed}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
        >
          {saving ? 'שומר...' : t('button.save')}
        </button>
      </div>
    </div>
  );
}
