/**
 * Customer Onboarding Email Campaign for Alpha Testing
 * Send automatically via Firebase Cloud Functions
 * Usage: Deploy to Cloud Functions, triggered by Firestore shop creation
 */

import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Configure email service (using SendGrid or Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface OnboardingEmailParams {
  to: string;
  shopName: string;
  ownerName: string;
  dashboardUrl: string;
  apiKey: string;
  templateName:
    | 'pre_onboarding'
    | 'day1_confirmation'
    | 'day3_followup'
    | 'week1_pulse'
    | 'week2_feature_update'
    | 'week4_monthly_review'
    | 'renewal_offer';
}

const emailTemplates = {
  pre_onboarding: (params: OnboardingEmailParams) => ({
    subject: `🎉 ברוכים הבאים לBarber Agent - ${params.shopName}`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; }
    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💈 Barber Agent</h1>
    <p>מערכת תורים חדשנית לעסק שלך</p>
  </div>
  
  <div class="content">
    <p>שלום ${params.ownerName},</p>
    
    <p>אנחנו שמחים להודיע שהמערכת שלך בBarber Agent קצר לשימוש! 🎯</p>
    
    <h2>מה בהמתנה:</h2>
    <ul>
      <li>📱 <strong>ניהול תורים אוטומטי</strong> - הפחת ביטולים וחוסרי מופע ב-50%</li>
      <li>💬 <strong>התראות WhatsApp</strong> - לקוחות קיבלו תזכורות בפעם אחת</li>
      <li>👥 <strong>ניהול צוות</strong> - הקצה תורים לעובדים בקליק</li>
      <li>📊 <strong>דוחות ודיווחים</strong> - ראה את ההשפעה של הפלטפורמה</li>
    </ul>
    
    <h2>השלב הבא:</h2>
    <p>נתקבל עימך להתחיל בו-בימים הקרובים. לפני הזה:</p>
    
    <ol>
      <li><strong>אשר את הפרטים שלך</strong> - וודא שהנתונים שלך נכונים</li>
      <li><strong>הגדר שעות פתיחה</strong> - הכנס את שעות הפעילות שלך</li>
      <li><strong>הוסף את צוות שלך</strong> - הוסף שמות וטלפונים של עובדים</li>
    </ol>
    
    <p>
      <a href="${params.dashboardUrl}" class="button">כנס לדשבורד &rarr;</a>
    </p>
    
    <p><strong>שם משתמש:</strong> ${params.to}</p>
    <p><strong>קוד API:</strong> ${params.apiKey}</p>
    
    <hr>
    
    <p>יש לך שאלות? <a href="mailto:support@barber-agent.co.il">צור קשר</a> או השב לדוא"ל זה.</p>
    
    <p>בברכה,<br>
    צוות Barber Agent 💈</p>
  </div>
</body>
</html>
    `,
  }),

  day1_confirmation: (params: OnboardingEmailParams) => ({
    subject: `✅ יום 1: הגדרת Barber Agent בוצעה בהצלחה!`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; }
    .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <h2>✨ ${params.shopName} - יום 1 סיום בהצלחה!</h2>
  
  <div class="success-box">
    <p>👏 כל הגדרות הבסיס שלך הוגדרו בהצלחה:</p>
    <ul>
      <li>✅ פרטי החנות</li>
      <li>✅ שעות פתיחה</li>
      <li>✅ רשימת צוות</li>
      <li>✅ שירותים ומחירים</li>
      <li>✅ חיבור WhatsApp Business</li>
    </ul>
  </div>
  
  <h3>מה הלאה?</h3>
  <p><strong>ימים 2-7:</strong> אנחנו נעקוב אחרי השימוש שלך ונעזור בהתאמות</p>
  
  <p>לתשובות מהירות - <a href="https://wa.me/972546598636?text=שלום%20Barber%20Agent">כתוב לנו בWhatsApp</a></p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),

  day3_followup: (params: OnboardingEmailParams) => ({
    subject: `🚀 יום 3: טיפ להגדיל תורים ב-30%`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h2>שלום ${params.ownerName},</h2>
  
  <p>אחרי 3 ימים בBarber Agent, יש לנו טיפ חם בשבילך:</p>
  
  <h3>טיפ #1: שתפ את קישור התור שלך</h3>
  <p>לקוחות שלך יכולים להזמין תור ישירות מ-WhatsApp!</p>
  <p><strong>קישור הזמנה:</strong> https://wa.me/972546598636?text=...הזמן%20לי%20תור</p>
  
  <h3>טיפ #2: שלח הזמנה לקוחות קיימים</h3>
  <p>האם יש לך רשימת לקוחות ישנים? שלח להם את ההודעה שלך בWA:</p>
  <blockquote>
    "היי! אנחנו החלנו להשתמש במערכת תורים חדשה 💈<br>
    עכשיו אתה יכול להזמין תור בWhatsApp בישירות! לחץ כאן: [קישור]"
  </blockquote>
  
  <h3>כיצד אנו עוזרים?</h3>
  <p>יש לנו צוות תמיכה זמין 24/7. רק השב לדוא"ל או כתוב לנו בWA.</p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),

  week1_pulse: (params: OnboardingEmailParams) => ({
    subject: `📊 שבוע 1: כיצד אתה עומד? סקר קצר`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h2>שלום ${params.ownerName},</h2>
  
  <p>עברנו שבוע אחד! 🎉</p>
  
  <p>רציתי לעמוד ולשאול:</p>
  
  <h3>הסקר שלנו (40 שניות):</h3>
  <ol>
    <li>האם לקוחות שלך הזמינו תור דרך המערכת?</li>
    <li>עד כמה קל היה להגדיר? (1-5)</li>
    <li>יש משהו שאנחנו יכולים לשפר?</li>
  </ol>
  
  <p><a href="https://forms.gle/xxx">השב לסקר &rarr;</a></p>
  
  <p>התשובות שלך חשובות מאוד בעבורנו!</p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),

  week2_feature_update: (params: OnboardingEmailParams) => ({
    subject: `🆕 תכונה חדשה: דוחות שבועיים וניתוח no-show`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h2>🚀 עדכון חדש עבורך</h2>
  
  <p>בשבוע 2, הוספנו:</p>
  
  <ul>
    <li><strong>📊 דוחות שבועיים</strong> - ראה כמה תורים בוצעו וביטולים</li>
    <li><strong>⚠️ עדכון No-Show</strong> - זהה לקוחות שלא הגיעו</li>
    <li><strong>📱 התראות ממשיות</strong> - קבל התראה כשלקוח מבטל</li>
  </ul>
  
  <p><a href="${params.dashboardUrl}/reports">ראה את הדוחות שלך &rarr;</a></p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),

  week4_monthly_review: (params: OnboardingEmailParams) => ({
    subject: `📈 סקירת חודש ראשון: התוצאות שלך`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    .stats { background: #f0f0f0; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h2>${params.shopName} - סקירת חודש ראשון</h2>
  
  <div class="stats">
    <p><strong>📱 תורים שהוזמנו:</strong> X תורים</p>
    <p><strong>✅ תורים שהסתיימו:</strong> Y תורים</p>
    <p><strong>⚠️ ביטולים:</strong> Z ביטולים (-X%)</p>
    <p><strong>💰 הערך השנתי (משוער):</strong> ₪Z,XXX</p>
  </div>
  
  <h3>המלצות עבור חודש 2:</h3>
  <ul>
    <li>שתפ את המערכת עם עוד לקוחות</li>
    <li>הגדר זכרונות אוטומטיים ל-24 שעות לפני התור</li>
    <li>בדוק את דוח ה-no-show ופתור בעיות</li>
  </ul>
  
  <p><strong>רוצה לדבר? בואו לשיחה קצרה (15 דק') כדי לדון בתוצאות.</strong></p>
  
  <p><a href="https://calendar.google.com/calendar/u/0/r/eventedit?dates=...">בחר זמן לשיחה &rarr;</a></p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),

  renewal_offer: (params: OnboardingEmailParams) => ({
    subject: `💰 הצעה מיוחדת: 30% הנחה על חודש 2 של Barber Agent`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    .offer-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 5px; text-align: center; }
  </style>
</head>
<body>
  <h2>${params.shopName} - הצעה מיוחדת לחודש 2!</h2>
  
  <div class="offer-box">
    <h1>🎁 30% הנחה</h1>
    <p><strong>₪420 בחודש 2</strong> (במקום ₪600)</p>
    <p>תוקף עד תאריך...</p>
  </div>
  
  <h3>מדוע הנחה?</h3>
  <p>אתה הוברתנו עם משוב עכשוו, אנחנו רוצים להישאר פרטנר שלך! 💙</p>
  
  <h3>הצעות נוספות:</h3>
  <ul>
    <li>קבל עד 3 חודשים בחינם אם תרגיל 2 חברים (referral)</li>
    <li>שדרוג לפרימיום (דוחות מתקדמים) ב-₪100/חודש</li>
  </ul>
  
  <p><a href="${params.dashboardUrl}/billing">חדש את המנוי שלך &rarr;</a></p>
  
  <p>בברכה,<br>צוות Barber Agent</p>
</body>
</html>
    `,
  }),
};

export const sendOnboardingEmail = functions.firestore
  .document('shops/{shopId}')
  .onCreate(async (snap, context) => {
    const shop = snap.data();
    const shopId = context.params.shopId;

    console.log(`📧 New shop created: ${shopId}`);

    // Get owner details
    const ownerRef = await db.collection('users').where('shop_id', '==', shopId).limit(1).get();

    if (ownerRef.empty) {
      console.error(`No owner found for shop ${shopId}`);
      return;
    }

    const owner = ownerRef.docs[0].data();
    const dashboardUrl = `https://barber-agent.vercel.app/dashboard/${shopId}`;

    const emailParams: OnboardingEmailParams = {
      to: owner.email,
      shopName: shop.name,
      ownerName: owner.name,
      dashboardUrl,
      apiKey: shop.api_key,
      templateName: 'pre_onboarding',
    };

    try {
      const template = emailTemplates[emailParams.templateName](emailParams);

      await transporter.sendMail({
        from: 'support@barber-agent.co.il',
        to: emailParams.to,
        subject: template.subject,
        html: template.html,
      });

      console.log(`✅ Email sent to ${emailParams.to}`);

      // Log email send in Firestore
      await db
        .collection('shops')
        .doc(shopId)
        .collection('communications')
        .doc(`email_${Date.now()}`)
        .set({
          type: 'onboarding_email',
          template: emailParams.templateName,
          sent_to: owner.email,
          sent_at: admin.firestore.Timestamp.now(),
          status: 'delivered',
        });
    } catch (error) {
      console.error(`❌ Failed to send email to ${emailParams.to}:`, error);

      // Log failure
      await db
        .collection('shops')
        .doc(shopId)
        .collection('communications')
        .doc(`email_failed_${Date.now()}`)
        .set({
          type: 'onboarding_email',
          template: emailParams.templateName,
          sent_to: owner.email,
          sent_at: admin.firestore.Timestamp.now(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
  });

// Schedule follow-up emails (Day 3, Week 1, Week 2, Week 4)
export const scheduleFollowupEmails = functions.pubsub
  .schedule('every day 10:00')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('📧 Checking for scheduled follow-up emails...');

    // Get all active shops
    const shopsSnapshot = await db
      .collection('shops')
      .where('status', '==', 'active')
      .where('trial_ends_at', '>', admin.firestore.Timestamp.now())
      .get();

    for (const shopDoc of shopsSnapshot.docs) {
      const shop = shopDoc.data();
      const createdAt = shop.created_at.toDate();
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Determine which email to send
      let emailTemplate: keyof typeof emailTemplates | null = null;

      if (daysSinceCreation === 3) emailTemplate = 'day3_followup';
      else if (daysSinceCreation === 7) emailTemplate = 'week1_pulse';
      else if (daysSinceCreation === 14) emailTemplate = 'week2_feature_update';
      else if (daysSinceCreation === 28) emailTemplate = 'week4_monthly_review';
      else if (daysSinceCreation === 30) emailTemplate = 'renewal_offer';

      if (!emailTemplate) continue;

      // Check if email was already sent
      const existingEmail = await db
        .collection('shops')
        .doc(shopDoc.id)
        .collection('communications')
        .where('template', '==', emailTemplate)
        .limit(1)
        .get();

      if (!existingEmail.empty) {
        console.log(`Email ${emailTemplate} already sent for ${shopDoc.id}`);
        continue;
      }

      // Get owner
      const ownerRef = await db.collection('users').where('shop_id', '==', shopDoc.id).limit(1).get();

      if (ownerRef.empty) continue;

      const owner = ownerRef.docs[0].data();
      const emailParams: OnboardingEmailParams = {
        to: owner.email,
        shopName: shop.name,
        ownerName: owner.name,
        dashboardUrl: `https://barber-agent.vercel.app/dashboard/${shopDoc.id}`,
        apiKey: shop.api_key,
        templateName: emailTemplate,
      };

      try {
        const template = emailTemplates[emailTemplate](emailParams);

        await transporter.sendMail({
          from: 'support@barber-agent.co.il',
          to: emailParams.to,
          subject: template.subject,
          html: template.html,
        });

        console.log(`✅ ${emailTemplate} sent to ${owner.email}`);

        // Log in Firestore
        await db
          .collection('shops')
          .doc(shopDoc.id)
          .collection('communications')
          .doc(`email_${emailTemplate}_${Date.now()}`)
          .set({
            type: 'follow_up_email',
            template: emailTemplate,
            sent_to: owner.email,
            sent_at: admin.firestore.Timestamp.now(),
            status: 'delivered',
          });
      } catch (error) {
        console.error(`❌ Failed to send ${emailTemplate} to ${owner.email}:`, error);
      }
    }
  });
