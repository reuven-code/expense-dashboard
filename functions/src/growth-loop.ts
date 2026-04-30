/**
 * Barber Agent Referral & Growth Loop System
 * Track customer referrals, track growth metrics, reward programs
 * Deploy to Firestore + Cloud Functions
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

// ============================================
// SECTION 1: Referral Program
// ============================================

/**
 * Create referral link for a shop
 * Usage: Create when shop signs up, share in emails/marketing
 */
export async function createReferralLink(shopId: string, ownerEmail: string) {
  const referralCode = `REF_${shopId.substring(0, 8).toUpperCase()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  await db.collection('shops').doc(shopId).collection('referrals').doc('program').set(
    {
      referral_code: referralCode,
      referral_link: `https://barber-agent.co.il?ref=${referralCode}`,
      referrals_made: 0,
      referrals_converted: 0,
      total_discount_value: 0,
      active: true,
      created_at: admin.firestore.Timestamp.now(),
    },
    { merge: true }
  );

  return referralCode;
}

/**
 * Track referral (when new customer uses referral code)
 */
export const trackReferral = functions.firestore
  .document('shops/{shopId}')
  .onCreate(async (snap, context) => {
    const shop = snap.data();
    const shopId = context.params.shopId;

    // Check if new shop came from referral
    const referralCode = shop.referral_source; // e.g., REF_SHOP123_ABC456

    if (!referralCode) return; // No referral

    // Find referring shop
    const referringShopSnap = await db
      .collectionGroup('referrals')
      .where('referral_code', '==', referralCode)
      .limit(1)
      .get();

    if (referringShopSnap.empty) return;

    const referrerShopId = referringShopSnap.docs[0].ref.parent.parent?.id;
    if (!referrerShopId) return;

    // Create referral tracking document
    await db.collection('shops').doc(referrerShopId).collection('referrals').doc(`referral_${Date.now()}`).set({
      referred_shop_id: shopId,
      referred_shop_name: shop.name,
      referred_date: admin.firestore.Timestamp.now(),
      reward_status: 'pending', // pending, claimed
      reward_type: 'discount', // 3 free months
      reward_value: 1800, // ₪600 x 3 months
      conversion_date: null,
      notes: `Referred by ${shop.name}`,
    });

    // Update referral program stats
    await db
      .collection('shops')
      .doc(referrerShopId)
      .collection('referrals')
      .doc('program')
      .update({
        referrals_made: admin.firestore.FieldValue.increment(1),
      });

    console.log(`✅ Referral tracked: ${referrerShopId} → ${shopId}`);
  });

/**
 * Claim referral reward (3 free months when referred customer renews)
 */
export async function claimReferralReward(referrerShopId: string, referralDocId: string) {
  const db = admin.firestore();

  // Update referral document
  await db
    .collection('shops')
    .doc(referrerShopId)
    .collection('referrals')
    .doc(referralDocId)
    .update({
      reward_status: 'claimed',
      reward_claimed_date: admin.firestore.Timestamp.now(),
    });

  // Update referral program stats
  await db
    .collection('shops')
    .doc(referrerShopId)
    .collection('referrals')
    .doc('program')
    .update({
      referrals_converted: admin.firestore.FieldValue.increment(1),
      total_discount_value: admin.firestore.FieldValue.increment(1800),
    });

  // Create billing credit (3 months free)
  await db.collection('shops').doc(referrerShopId).collection('billing_credits').doc(`credit_${Date.now()}`).set({
    type: 'referral_reward',
    amount_nis: 1800,
    description: '3 free months - referral reward',
    created_date: admin.firestore.Timestamp.now(),
    expires_date: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)), // 6 months
    used: false,
  });

  console.log(`✅ Referral reward claimed for ${referrerShopId}`);
}

// ============================================
// SECTION 2: Customer Health Score
// ============================================

interface HealthScore {
  score: number; // 0-100
  tier: 'high' | 'medium' | 'low'; // Which tier
  risk_level: 'green' | 'yellow' | 'red'; // Churn risk
}

export async function calculateCustomerHealthScore(shopId: string): Promise<HealthScore> {
  const shopRef = db.collection('shops').doc(shopId);

  // Get metrics
  const appointmentsSnap = await shopRef.collection('appointments').get();
  const usersSnap = await shopRef.collection('audit_logs').where('action', '==', 'login').get();

  // Calculate score components (weighted)
  let score = 0;

  // 1. Usage frequency (30%)
  const lastWeekAppointments = appointmentsSnap.docs.filter((doc) => {
    const appointmentDate = new Date(doc.data().created_at.toDate());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return appointmentDate > oneWeekAgo;
  });
  const usageScore = Math.min((lastWeekAppointments.length / 5) * 100, 100); // Target: 5+ appointments/week
  score += usageScore * 0.3;

  // 2. Completion rate (30%)
  const completedAppointments = appointmentsSnap.docs.filter((doc) => doc.data().status === 'completed').length;
  const totalAppointments = appointmentsSnap.size;
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
  score += completionRate * 0.3;

  // 3. Dashboard engagement (20%)
  const lastWeekLogins = usersSnap.docs.filter((doc) => {
    const loginDate = new Date(doc.data().timestamp.toDate());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return loginDate > oneWeekAgo;
  });
  const engagementScore = Math.min((lastWeekLogins.length / 4) * 100, 100); // Target: 4+ logins/week
  score += engagementScore * 0.2;

  // 4. No-show rate (20%)
  const noShows = appointmentsSnap.docs.filter((doc) => doc.data().status === 'no_show').length;
  const noShowRate = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;
  const noShowScore = Math.max(100 - noShowRate * 2, 0); // Lower no-shows = higher score
  score += noShowScore * 0.2;

  // Normalize to 0-100
  score = Math.round(Math.max(0, Math.min(100, score)));

  // Determine tier and risk
  let tier: 'high' | 'medium' | 'low' = 'low';
  let risk_level: 'green' | 'yellow' | 'red' = 'red';

  if (score >= 75) {
    tier = 'high';
    risk_level = 'green';
  } else if (score >= 50) {
    tier = 'medium';
    risk_level = 'yellow';
  } else {
    tier = 'low';
    risk_level = 'red';
  }

  return { score, tier, risk_level };
}

/**
 * Scheduled job to update health scores daily
 */
export const updateHealthScores = functions.pubsub
  .schedule('every day 06:00')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('📊 Updating customer health scores...');

    const shopsSnap = await db.collection('shops').where('status', '==', 'active').get();

    for (const shopDoc of shopsSnap.docs) {
      const health = await calculateCustomerHealthScore(shopDoc.id);

      await shopDoc.ref.update({
        health_score: health.score,
        health_tier: health.tier,
        churn_risk: health.risk_level,
        health_score_updated_at: admin.firestore.Timestamp.now(),
      });

      console.log(`✅ ${shopDoc.id}: Score ${health.score} (${health.risk_level})`);
    }
  });

// ============================================
// SECTION 3: Growth Loop & Upsell
// ============================================

export interface GrowthOpportunity {
  shopId: string;
  opportunity: string;
  actionItem: string;
  upsellProduct?: string; // e.g., "SMS reminders", "Advanced reports"
  estimatedValue?: number; // ₪ value
}

export async function identifyGrowthOpportunities(shopId: string): Promise<GrowthOpportunity[]> {
  const shopRef = db.collection('shops').doc(shopId);
  const opportunities: GrowthOpportunity[] = [];

  // Get health score
  const health = await calculateCustomerHealthScore(shopId);
  const appointmentsSnap = await shopRef.collection('appointments').get();

  // Opportunity 1: High no-show rate
  const noShows = appointmentsSnap.docs.filter((doc) => doc.data().status === 'no_show').length;
  const noShowRate = appointmentsSnap.size > 0 ? (noShows / appointmentsSnap.size) * 100 : 0;

  if (noShowRate > 20) {
    opportunities.push({
      shopId,
      opportunity: 'High no-show rate detected',
      actionItem: 'Upsell SMS reminders (24h & 1h before)',
      upsellProduct: 'SMS Reminders',
      estimatedValue: 100, // ₪100/month extra
    });
  }

  // Opportunity 2: Low usage
  if (health.score < 50) {
    opportunities.push({
      shopId,
      opportunity: 'Low engagement - at risk of churn',
      actionItem: 'Schedule 1:1 onboarding call, offer white-glove service',
      upsellProduct: 'Premium Support',
      estimatedValue: 50, // ₪50/month extra
    });
  }

  // Opportunity 3: Scaling - high usage
  const lastWeekAppointments = appointmentsSnap.docs.filter((doc) => {
    const appointmentDate = new Date(doc.data().created_at.toDate());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return appointmentDate > oneWeekAgo;
  });

  if (lastWeekAppointments.length > 20) {
    opportunities.push({
      shopId,
      opportunity: 'High usage - ready to scale',
      actionItem: 'Offer advanced analytics & reports',
      upsellProduct: 'Advanced Analytics',
      estimatedValue: 150, // ₪150/month extra
    });
  }

  // Opportunity 4: Referral program enrollment
  const referralSnap = await shopRef.collection('referrals').doc('program').get();

  if (!referralSnap.exists) {
    opportunities.push({
      shopId,
      opportunity: 'Not enrolled in referral program',
      actionItem: 'Offer ₪600 credit for each successful referral',
      upsellProduct: 'Referral Program',
      estimatedValue: 0, // Customer acquisition cost mitigation
    });
  }

  return opportunities;
}

/**
 * Scheduled job to identify and send growth opportunities
 */
export const identifyGrowthLoops = functions.pubsub
  .schedule('every week friday 10:00')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('🚀 Identifying growth opportunities...');

    const shopsSnap = await db.collection('shops').where('status', '==', 'active').get();

    for (const shopDoc of shopsSnap.docs) {
      const opportunities = await identifyGrowthOpportunities(shopDoc.id);

      if (opportunities.length === 0) continue;

      // Store opportunities
      for (const opp of opportunities) {
        await db
          .collection('shops')
          .doc(shopDoc.id)
          .collection('growth_opportunities')
          .doc(`opp_${Date.now()}`)
          .set({
            opportunity: opp.opportunity,
            action_item: opp.actionItem,
            upsell_product: opp.upsellProduct,
            estimated_value: opp.estimatedValue,
            created_at: admin.firestore.Timestamp.now(),
            status: 'identified', // identified → proposed → claimed
          });
      }

      console.log(`✅ ${shopDoc.id}: ${opportunities.length} opportunities identified`);
    }
  });

// ============================================
// SECTION 4: Churn Prediction & Retention
// ============================================

export async function getCustomerChurnRiskStatus(
  shopId: string
): Promise<{
  atRisk: boolean;
  daysUntilChurn: number;
  retentionActions: string[];
}> {
  const health = await calculateCustomerHealthScore(shopId);

  const churnDays =
    health.risk_level === 'red'
      ? 7 // Red = likely to churn in 7 days
      : health.risk_level === 'yellow'
        ? 14 // Yellow = at risk in 14 days
        : 999; // Green = low risk

  const retentionActions: string[] = [];

  if (health.risk_level === 'red') {
    retentionActions.push('🚨 Call customer immediately');
    retentionActions.push('Offer support assistance');
    retentionActions.push('Consider discount/incentive');
  } else if (health.risk_level === 'yellow') {
    retentionActions.push('⚠️ Send engagement email');
    retentionActions.push('Share success stories / tips');
    retentionActions.push('Invite to webinar / training');
  }

  return {
    atRisk: health.risk_level !== 'green',
    daysUntilChurn: churnDays,
    retentionActions,
  };
}

/**
 * Scheduled churn risk alerts
 */
export const alertChurnRisk = functions.pubsub
  .schedule('every day 08:00')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('⚠️ Checking for churn risks...');

    const shopsSnap = await db.collection('shops').where('status', '==', 'active').get();

    for (const shopDoc of shopsSnap.docs) {
      const churnStatus = await getCustomerChurnRiskStatus(shopDoc.id);

      if (!churnStatus.atRisk) continue;

      // Create alert in database
      await db.collection('internal_alerts').doc(`churn_${Date.now()}_${shopDoc.id}`).set({
        alert_type: 'churn_risk',
        shop_id: shopDoc.id,
        shop_name: shopDoc.data().name,
        risk_level: (await calculateCustomerHealthScore(shopDoc.id)).risk_level,
        days_until_churn: churnStatus.daysUntilChurn,
        actions: churnStatus.retentionActions,
        created_at: admin.firestore.Timestamp.now(),
        status: 'open',
      });

      // Send to admin dashboard
      console.log(`🚨 CHURN ALERT: ${shopDoc.data().name} - ${churnStatus.daysUntilChurn} days until churn`);
    }
  });

// ============================================
// SECTION 5: Revenue Expansion Tracking
// ============================================

export interface RevenueExpansion {
  shopId: string;
  currentMRR: number; // ₪600
  potentialMRR: number; // with upsells
  expansionGaps: { product: string; potential: number }[];
}

export async function analyzeRevenueExpansion(shopId: string): Promise<RevenueExpansion> {
  const opportunities = await identifyGrowthOpportunities(shopId);

  const currentMRR = 600; // Base price
  const potentialExpansions = opportunities.filter((o) => o.estimatedValue).map((o) => ({
    product: o.upsellProduct || '',
    potential: o.estimatedValue || 0,
  }));

  const potentialMRR = currentMRR + potentialExpansions.reduce((sum, exp) => sum + exp.potential, 0);

  return {
    shopId,
    currentMRR,
    potentialMRR,
    expansionGaps: potentialExpansions,
  };
}

// ============================================
// SECTION 6: Forecasting
// ============================================

export async function forecastARR(monthlyNewCustomers: number, churnRate: number = 0.05) {
  /**
   * Simple forecast:
   * - Start with 3 customers in May
   * - Add X new customers per month
   * - Apply churn rate (5% = 0.05)
   * - Calculate ARR
   */

  const customers: number[] = [3]; // May
  let currentMonth = 0;

  for (currentMonth = 1; currentMonth < 12; currentMonth++) {
    const prevMonthCustomers = customers[currentMonth - 1];
    const churnedCustomers = Math.ceil(prevMonthCustomers * churnRate);
    const newMonthTotal = prevMonthCustomers - churnedCustomers + monthlyNewCustomers;
    customers.push(Math.max(0, newMonthTotal)); // Don't go negative
  }

  const endOfYearCustomers = customers[11]; // December
  const estimatedARR = endOfYearCustomers * 600 * 12; // ₪600/month × 12

  return {
    startingCustomers: 3,
    monthlyNewCustomers,
    endOfYearCustomers,
    churnRate: `${(churnRate * 100).toFixed(0)}%`,
    estimatedARR: `₪${estimatedARR.toLocaleString('he-IL')}`,
  };
}

/**
 * Example forecasts
 */
const conservativeForecast = forecastARR(3, 0.1); // 3 new/month, 10% churn → ₪86,400/year
const optimisticForecast = forecastARR(8, 0.05); // 8 new/month, 5% churn → ₪518,400/year

console.log('Conservative Forecast:', conservativeForecast);
console.log('Optimistic Forecast:', optimisticForecast);
