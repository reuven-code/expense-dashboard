import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppointmentStore } from '../stores/appointmentStore';
import { apiClient } from '../services/apiClient';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  businessId,
  onSuccess,
}: CreateAppointmentModalProps) {
  const { t, dir } = useLanguage();
  const { addAppointment } = useAppointmentStore();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    service: 'haircut',
    date: '',
    time: '',
    notes: '',
  });

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date) {
      const fetchSlots = async () => {
        try {
          const availability = await apiClient.getAvailability(businessId, formData.date);
          setAvailableSlots(availability.best_slots.map((s: any) => s.time));
        } catch (err) {
          setAvailableSlots([]);
        }
      };
      fetchSlots();
    }
  }, [formData.date, businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.customer_name || !formData.customer_phone || !formData.date || !formData.time) {
      setError('אנא מלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      const appointment = await apiClient.createAppointment(businessId, {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        duration_minutes: 30,
        notes: formData.notes,
      });

      addAppointment(appointment);
      setFormData({
        customer_name: '',
        customer_phone: '',
        service: 'haircut',
        date: '',
        time: '',
        notes: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir={dir}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">{t('modal.create_appointment')}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.customer_name')}
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.customer_phone')}
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.service')}
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="haircut">חיתוך</option>
              <option value="shave">גילוח</option>
              <option value="coloring">צביעה</option>
              <option value="beard_trim">גימור זקן</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.date')}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.time')}
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || availableSlots.length === 0}
            >
              <option value="">בחר שעה</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {availableSlots.length === 0 && formData.date && (
              <p className="text-sm text-yellow-600 mt-1">לא זמינות עכשיו באותו תאריך</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('form.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
            >
              {loading ? t('message.loading') : t('button.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
            >
              {t('button.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
