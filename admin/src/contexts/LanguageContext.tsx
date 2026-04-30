import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  he: {
    'app.title': 'לוח בקרה לעסק',
    'nav.appointments': 'תורים',
    'nav.staff': 'עובדים',
    'nav.hours': 'שעות פתיחה',
    'nav.settings': 'הגדרות',
    'nav.logout': 'יציאה',
    'header.welcome': 'ברוכים הבאים',
    'button.create': 'יצירה',
    'button.edit': 'עריכה',
    'button.delete': 'מחיקה',
    'button.save': 'שמירה',
    'button.cancel': 'ביטול',
    'button.confirm': 'אישור',
    'status.pending': 'בהמתנה',
    'status.confirmed': 'מאושר',
    'status.cancelled': 'בוטל',
    'status.completed': 'הושלם',
    'table.date': 'תאריך',
    'table.time': 'שעה',
    'table.customer': 'לקוח',
    'table.phone': 'טלפון',
    'table.service': 'שירות',
    'table.staff': 'עובד',
    'table.status': 'סטטוס',
    'table.actions': 'פעולות',
    'modal.create_appointment': 'יצירת תור חדש',
    'modal.edit_appointment': 'עריכת תור',
    'modal.confirm_delete': 'אתה בטוח?',
    'form.customer_name': 'שם הלקוח',
    'form.customer_phone': 'טלפון הלקוח',
    'form.service': 'שירות',
    'form.date': 'תאריך',
    'form.time': 'שעה',
    'form.duration': 'משך בדקות',
    'form.notes': 'הערות',
    'form.staff_name': 'שם העובד',
    'form.staff_phone': 'טלפון העובד',
    'form.staff_email': 'דוא״ל של העובד',
    'form.specialties': 'התמחויות',
    'error.required_field': 'שדה זה נדרש',
    'error.invalid_phone': 'מספר טלפון לא תקין',
    'error.invalid_email': 'דוא״ל לא תקין',
    'error.invalid_time': 'שעה לא תקינה',
    'success.created': 'נוצר בהצלחה',
    'success.updated': 'עודכן בהצלחה',
    'success.deleted': 'נמחק בהצלחה',
    'message.no_data': 'אין נתונים להצגה',
    'message.loading': 'טוען...',
    'message.error': 'אירעה שגיאה',
  },
  en: {
    'app.title': 'Dashboard',
    'nav.appointments': 'Appointments',
    'nav.staff': 'Staff',
    'nav.hours': 'Business Hours',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'header.welcome': 'Welcome',
    'button.create': 'Create',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.confirm': 'Confirm',
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.cancelled': 'Cancelled',
    'status.completed': 'Completed',
    'table.date': 'Date',
    'table.time': 'Time',
    'table.customer': 'Customer',
    'table.phone': 'Phone',
    'table.service': 'Service',
    'table.staff': 'Staff',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'modal.create_appointment': 'Create New Appointment',
    'modal.edit_appointment': 'Edit Appointment',
    'modal.confirm_delete': 'Are you sure?',
    'form.customer_name': 'Customer Name',
    'form.customer_phone': 'Customer Phone',
    'form.service': 'Service',
    'form.date': 'Date',
    'form.time': 'Time',
    'form.duration': 'Duration (minutes)',
    'form.notes': 'Notes',
    'form.staff_name': 'Staff Name',
    'form.staff_phone': 'Staff Phone',
    'form.staff_email': 'Staff Email',
    'form.specialties': 'Specialties',
    'error.required_field': 'This field is required',
    'error.invalid_phone': 'Invalid phone number',
    'error.invalid_email': 'Invalid email',
    'error.invalid_time': 'Invalid time',
    'success.created': 'Created successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'message.no_data': 'No data to display',
    'message.loading': 'Loading...',
    'message.error': 'An error occurred',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'he';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
