/**
 * Firestore Test Data Setup for Alpha Testing
 * Run this script to populate pilot shop data
 * Usage: npx ts-node scripts/setup-pilot-data.ts
 */

import admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

interface PilotShop {
  id: string;
  name: string;
  city: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  business: {
    category: string;
    staff_count: number;
    focus: string;
  };
}

const PILOT_SHOPS: PilotShop[] = [
  {
    id: 'shop-transitcut-tlv',
    name: 'TransitCut Tel Aviv',
    city: 'Tel Aviv',
    owner: {
      name: 'David Levi',
      email: 'david@transitcut.co.il',
      phone: '0509876543',
    },
    business: {
      category: 'barbershop',
      staff_count: 3,
      focus: 'no-show reduction',
    },
  },
  {
    id: 'shop-kingscrown-jlm',
    name: 'Kings Crown Jerusalem',
    city: 'Jerusalem',
    owner: {
      name: 'Yosef Bergman',
      email: 'yosef@kingscrown.co.il',
      phone: '0502222222',
    },
    business: {
      category: 'barbershop',
      staff_count: 4,
      focus: 'staff coordination',
    },
  },
  {
    id: 'shop-moderncuts-haifa',
    name: 'Modern Cuts Haifa',
    city: 'Haifa',
    owner: {
      name: 'Nadia Saleh',
      email: 'nadia@moderncuts.co.il',
      phone: '0544333333',
    },
    business: {
      category: 'barbershop',
      staff_count: 2,
      focus: 'growth scaling',
    },
  },
];

async function setupPilotData() {
  console.log('🚀 Setting up Firestore pilot data...\n');

  for (const shop of PILOT_SHOPS) {
    try {
      // 1. Create shop document
      await db.collection('shops').doc(shop.id).set(
        {
          name: shop.name,
          city: shop.city,
          owner_id: `user_${shop.owner.name.replace(/\s/g, '_').toLowerCase()}`,
          created_at: admin.firestore.Timestamp.now(),
          status: 'active',
          plan: 'trial', // 14-day free trial
          trial_ends_at: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          ),
          api_key: `sk_test_${Math.random().toString(36).substring(2, 15)}`,
        },
        { merge: true }
      );

      // 2. Create owner user document
      await db.collection('users').doc(`user_${shop.owner.name.replace(/\s/g, '_').toLowerCase()}`).set(
        {
          name: shop.owner.name,
          email: shop.owner.email,
          phone: shop.owner.phone,
          shop_id: shop.id,
          role: 'admin',
          created_at: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );

      // 3. Create staff members
      const staffNames = [
        ['David', 'Levi', 'david_staff'],
        ['Moshe', 'Cohen', 'moshe_staff'],
        ['Shlomi', 'Mizrahi', 'shlomi_staff'],
        ['Eli', 'Stein', 'eli_staff'],
      ];

      for (let i = 0; i < shop.business.staff_count; i++) {
        const [first, last, id] = staffNames[i % staffNames.length];
        await db
          .collection('shops')
          .doc(shop.id)
          .collection('staff')
          .doc(`staff_${i + 1}`)
          .set({
            name: `${first} ${last}`,
            email: `${id}@${shop.id}.co.il`,
            phone: `0549${String(Math.floor(Math.random() * 9000000) + 1000000).padStart(7, '0')}`,
            specialties: ['haircut', 'shave', 'beard_trim'],
            active: true,
            created_at: admin.firestore.Timestamp.now(),
          });
      }

      // 4. Create business hours (Sunday-Friday, 8am-7pm, closed Saturday)
      const businessHours = {
        Sunday: { open: '08:00', close: '19:00', closed: false },
        Monday: { open: '08:00', close: '19:00', closed: false },
        Tuesday: { open: '08:00', close: '19:00', closed: false },
        Wednesday: { open: '08:00', close: '19:00', closed: false },
        Thursday: { open: '08:00', close: '19:00', closed: false },
        Friday: { open: '08:00', close: '17:00', closed: false },
        Saturday: { open: '00:00', close: '00:00', closed: true },
      };

      await db.collection('shops').doc(shop.id).collection('config').doc('business_hours').set(businessHours);

      // 5. Create services
      const services = [
        { name: 'haircut', duration: 30, price: 60 },
        { name: 'shave', duration: 20, price: 40 },
        { name: 'beard_trim', duration: 15, price: 25 },
        { name: 'kids_cut', duration: 25, price: 40 },
      ];

      for (const service of services) {
        await db
          .collection('shops')
          .doc(shop.id)
          .collection('services')
          .doc(service.name)
          .set({
            name: service.name,
            duration_minutes: service.duration,
            price_nis: service.price,
            active: true,
            created_at: admin.firestore.Timestamp.now(),
          });
      }

      // 6. Create sample appointments (past week)
      const now = new Date();
      for (let i = 0; i < 8; i++) {
        const appointmentDate = new Date(now);
        appointmentDate.setDate(appointmentDate.getDate() - i);
        
        // Skip if Saturday
        if (appointmentDate.getDay() === 6) {
          appointmentDate.setDate(appointmentDate.getDate() - 1);
        }

        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.random() > 0.5 ? 0 : 30;
        appointmentDate.setHours(hour, minute, 0, 0);

        const customers = [
          { name: 'אברהם כהן', phone: '0501111111' },
          { name: 'משה גולדשטיין', phone: '0502222222' },
          { name: 'יוסף יהודה', phone: '0503333333' },
          { name: 'דוד בן דוד', phone: '0504444444' },
        ];

        const customer = customers[i % customers.length];
        const statuses = ['confirmed', 'completed', 'no_show'];
        const status = i < 2 ? 'completed' : i === 2 ? 'no_show' : 'confirmed';

        await db
          .collection('shops')
          .doc(shop.id)
          .collection('appointments')
          .doc(`appt_${Date.now()}_${i}`)
          .set({
            customer_name: customer.name,
            customer_phone: customer.phone,
            service: 'haircut',
            date: appointmentDate.toISOString().split('T')[0],
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            duration_minutes: 30,
            status,
            staff_id: `staff_${(i % shop.business.staff_count) + 1}`,
            created_at: admin.firestore.Timestamp.fromDate(appointmentDate),
            updated_at: admin.firestore.Timestamp.now(),
          });
      }

      // 7. Create audit log entry
      await db
        .collection('shops')
        .doc(shop.id)
        .collection('audit_logs')
        .doc(`setup_${Date.now()}`)
        .set({
          action: 'pilot_shop_setup',
          user_id: 'system',
          timestamp: admin.firestore.Timestamp.now(),
          details: {
            staff_count: shop.business.staff_count,
            trial_days: 14,
            focus_area: shop.business.focus,
          },
        });

      console.log(`✅ ${shop.name} (${shop.city}) setup complete`);
      console.log(`   - Owner: ${shop.owner.name} (${shop.owner.email})`);
      console.log(`   - Staff: ${shop.business.staff_count} members`);
      console.log(`   - Sample data: 8 appointments loaded\n`);
    } catch (error) {
      console.error(`❌ Error setting up ${shop.name}:`, error);
    }
  }

  console.log('🎉 Pilot data setup complete!');
  console.log('\nNext steps:');
  console.log('1. Send onboarding email to pilot shop owners (templates in barber-agent-onboarding-templates.md)');
  console.log('2. Schedule Day 1 onboarding calls');
  console.log('3. Share admin dashboard login details');
  console.log('4. Begin Week 1 activation checklist');
}

setupPilotData()
  .then(() => {
    console.log('\n✨ Database setup complete. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
