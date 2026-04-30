import React, { useEffect, useState } from 'react';
import { useStaffStore } from '../stores/appointmentStore';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';

interface StaffForm {
  name: string;
  phone: string;
  email: string;
  specialties: string[];
}

export function StaffManagement() {
  const { t, dir } = useLanguage();
  const { staff, setStaff, addStaff, deleteStaff, loading, setLoading, error, setError } =
    useStaffStore();

  const [businessId] = useState('default-business');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<StaffForm>({
    name: '',
    phone: '',
    email: '',
    specialties: [],
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const staffList = await apiClient.getStaff(businessId);
        setStaff(staffList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [businessId, setStaff, setLoading, setError]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('שם וטלפון נדרשים');
      return;
    }

    try {
      const newStaff = await apiClient.createStaff(businessId, formData);
      addStaff(newStaff);
      setFormData({ name: '', phone: '', email: '', specialties: [] });
      setIsFormOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!window.confirm('בטוח שברצונך למחוק?')) return;

    try {
      await apiClient.deleteStaff(businessId, staffId);
      deleteStaff(staffId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t('message.loading')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.staff')}</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {t('button.create')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {t('message.no_data')}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t('button.delete')}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">טלפון:</span> {member.phone}
                </p>
                <p>
                  <span className="font-semibold">דוא״ל:</span> {member.email}
                </p>
                {member.specialties.length > 0 && (
                  <p>
                    <span className="font-semibold">התמחויות:</span> {member.specialties.join(', ')}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    member.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.active ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">הוסף עובד</h2>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('form.staff_name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('form.staff_phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('form.staff_email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {t('button.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('button.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
