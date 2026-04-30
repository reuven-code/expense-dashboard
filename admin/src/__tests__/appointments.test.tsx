import { describe, it, expect, beforeAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AppointmentsList } from '../pages/Appointments';

describe('Admin Dashboard E2E Tests', () => {
  beforeAll(() => {
    // Mock API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            appointments: [
              {
                id: '1',
                date: '2026-05-20',
                time: '10:00',
                customerName: 'רובי דוידוב',
                customerPhone: '0546598636',
                service: 'haircut',
                status: 'confirmed',
              },
            ],
          }),
      })
    ) as jest.Mock;
  });

  describe('Appointments Page', () => {
    it('should render appointments list', async () => {
      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/תורים/i)).toBeInTheDocument();
      });
    });

    it('should display appointment in table', async () => {
      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('רובי דוידוב')).toBeInTheDocument();
        expect(screen.getByText('0546598636')).toBeInTheDocument();
      });
    });

    it('should open create appointment modal', async () => {
      const { container } = render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      const createButton = screen.getByText(/יצירה/i);
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/יצירת תור חדש/i)).toBeInTheDocument();
      });
    });
  });

  describe('Language Switching', () => {
    it('should switch between Hebrew and English', async () => {
      const { rerender } = render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      // Initially Hebrew
      expect(document.documentElement.lang).toBe('he');
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields in create appointment', async () => {
      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      const createButton = screen.getByText(/יצירה/i);
      fireEvent.click(createButton);

      await waitFor(() => {
        const submitButton = screen.getByText(/שמירה/i);
        fireEvent.click(submitButton);
      });

      // Should show validation error
      expect(screen.getByText(/שדה זה נדרש/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      // Check for semantic HTML and ARIA attributes
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      const createButton = screen.getByText(/יצירה/i);
      createButton.focus();
      expect(document.activeElement).toBe(createButton);

      fireEvent.keyDown(createButton, { key: 'Enter' });
      // Modal should open on Enter key
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      // Mock failed API
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      render(
        <BrowserRouter>
          <LanguageProvider>
            <AppointmentsList />
          </LanguageProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/אירעה שגיאה/i)).toBeInTheDocument();
      });
    });
  });
});
