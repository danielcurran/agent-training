#!/usr/bin/env node
/**
 * seed.js — Load the intentional starting state for the SupportDesk lab.
 *
 * This creates the "SQL migration" starting point described in the tech spec:
 *   - One collection per SQL table (users, tickets, comments, products, knowledge_articles)
 *   - Documents are flat with foreign key fields (user_id, product_id, ticket_id, author_id)
 *   - NO embedded sub-documents
 *   - NO vector embeddings on knowledge_articles
 *   - NO compound indexes (only the default _id index)
 *
 * This is intentionally the wrong shape. The agent's job is to improve it.
 *
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --drop   # drops all collections before seeding (idempotent)
 */

const { connect } = require('../lib/db');
const { ObjectId } = require('mongodb');

const DROP = process.argv.includes('--drop');

// ── Stable IDs so foreign keys are consistent across collections ──────────────

const USERS = {
  alice:   new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
  bob:     new ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
  carol:   new ObjectId('cccccccccccccccccccccccc'),
  agent1:  new ObjectId('a1a1a1a1a1a1a1a1a1a1a1a1'),
  agent2:  new ObjectId('a2a2a2a2a2a2a2a2a2a2a2a2'),
};

const PRODUCTS = {
  core:    new ObjectId('d0d0d0d0d0d0d0d0d0d0d0d0'),
  mobile:  new ObjectId('d1d1d1d1d1d1d1d1d1d1d1d1'),
  api:     new ObjectId('d2d2d2d2d2d2d2d2d2d2d2d2'),
};

const TICKETS = {
  t1: new ObjectId('e1e1e1e1e1e1e1e1e1e1e1e1'),
  t2: new ObjectId('e2e2e2e2e2e2e2e2e2e2e2e2'),
  t3: new ObjectId('e3e3e3e3e3e3e3e3e3e3e3e3'),
  t4: new ObjectId('e4e4e4e4e4e4e4e4e4e4e4e4'),
  t5: new ObjectId('e5e5e5e5e5e5e5e5e5e5e5e5'),
};

// ── Seed data ─────────────────────────────────────────────────────────────────

const usersData = [
  { _id: USERS.alice,  name: 'Alice Nguyen',  email: 'alice@example.com',  role: 'customer' },
  { _id: USERS.bob,    name: 'Bob Okafor',    email: 'bob@example.com',    role: 'customer' },
  { _id: USERS.carol,  name: 'Carol Smith',   email: 'carol@example.com',  role: 'customer' },
  { _id: USERS.agent1, name: 'Dana Lee',      email: 'dana@support.com',   role: 'agent' },
  { _id: USERS.agent2, name: 'Ethan Kim',     email: 'ethan@support.com',  role: 'agent' },
];

const productsData = [
  { _id: PRODUCTS.core,   name: 'SupportDesk Core',   description: 'Core ticketing and triage features.' },
  { _id: PRODUCTS.mobile, name: 'SupportDesk Mobile', description: 'iOS and Android support app.' },
  { _id: PRODUCTS.api,    name: 'SupportDesk API',    description: 'REST and GraphQL API access.' },
];

// Flat tickets — foreign key fields only, no embedded user/product
const ticketsData = [
  {
    _id: TICKETS.t1,
    user_id: USERS.alice,
    product_id: PRODUCTS.core,
    status: 'open',
    priority: 'high',
    category: 'access',
    created_at: new Date('2026-04-01T09:00:00Z'),
  },
  {
    _id: TICKETS.t2,
    user_id: USERS.alice,
    product_id: PRODUCTS.mobile,
    status: 'open',
    priority: 'medium',
    category: 'billing',
    created_at: new Date('2026-04-02T11:30:00Z'),
  },
  {
    _id: TICKETS.t3,
    user_id: USERS.bob,
    product_id: PRODUCTS.core,
    status: 'in_progress',
    priority: 'urgent',
    category: 'bug',
    created_at: new Date('2026-04-03T08:15:00Z'),
  },
  {
    _id: TICKETS.t4,
    user_id: USERS.carol,
    product_id: PRODUCTS.api,
    status: 'resolved',
    priority: 'low',
    category: 'feature_request',
    created_at: new Date('2026-04-04T14:00:00Z'),
  },
  {
    _id: TICKETS.t5,
    user_id: USERS.bob,
    product_id: PRODUCTS.mobile,
    status: 'open',
    priority: 'high',
    category: 'access',
    created_at: new Date('2026-04-05T10:45:00Z'),
  },
];

// Flat comments — ticket_id and author_id as foreign keys, not embedded
const commentsData = [
  {
    _id: new ObjectId(),
    ticket_id: TICKETS.t1,
    author_id: USERS.agent1,
    body: 'Hi Alice, can you confirm which browser you are using?',
    created_at: new Date('2026-04-01T09:30:00Z'),
  },
  {
    _id: new ObjectId(),
    ticket_id: TICKETS.t1,
    author_id: USERS.alice,
    body: 'I am using Chrome 123. The login button just spins.',
    created_at: new Date('2026-04-01T10:00:00Z'),
  },
  {
    _id: new ObjectId(),
    ticket_id: TICKETS.t3,
    author_id: USERS.agent2,
    body: 'Reproducing now. Looks like a regression from last deploy.',
    created_at: new Date('2026-04-03T09:00:00Z'),
  },
  {
    _id: new ObjectId(),
    ticket_id: TICKETS.t3,
    author_id: USERS.bob,
    body: 'This is blocking our whole team. Please escalate.',
    created_at: new Date('2026-04-03T09:45:00Z'),
  },
  {
    _id: new ObjectId(),
    ticket_id: TICKETS.t4,
    author_id: USERS.agent1,
    body: 'Feature shipped in v2.4. Closing this ticket.',
    created_at: new Date('2026-04-04T16:00:00Z'),
  },
];

// Knowledge articles — NO embedding field (agent must add it in Stage 3)
const knowledgeArticlesData = [
  {
    _id: new ObjectId(),
    title: 'How to reset your password',
    body: 'To reset your password, click Forgot Password on the login page. You will receive an email with a reset link valid for 30 minutes. If you do not receive the email, check your spam folder or contact support.',
    tags: ['password', 'access', 'login'],
    created_at: new Date('2026-01-10T00:00:00Z'),
  },
  {
    _id: new ObjectId(),
    title: 'Understanding ticket priorities',
    body: 'SupportDesk uses four priority levels: low, medium, high, and urgent. Urgent tickets are responded to within 1 hour. High within 4 hours. Medium and low within 1 business day. Priority is set by the submitting customer and may be adjusted by a support agent.',
    tags: ['priority', 'sla', 'tickets'],
    created_at: new Date('2026-01-15T00:00:00Z'),
  },
  {
    _id: new ObjectId(),
    title: 'Billing and subscription FAQ',
    body: 'Your subscription renews automatically on the same day each month. To cancel, go to Account Settings > Billing > Cancel Subscription. Refunds are available within 7 days of renewal. For disputed charges, open a billing ticket and include your invoice number.',
    tags: ['billing', 'subscription', 'refund'],
    created_at: new Date('2026-02-01T00:00:00Z'),
  },
  {
    _id: new ObjectId(),
    title: 'API rate limits and quotas',
    body: 'The SupportDesk API allows 1000 requests per minute per API key. If you exceed the limit, you will receive a 429 Too Many Requests response. Rate limit headers are included in every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.',
    tags: ['api', 'rate-limit', 'quota'],
    created_at: new Date('2026-02-20T00:00:00Z'),
  },
  {
    _id: new ObjectId(),
    title: 'Mobile app troubleshooting',
    body: 'If the SupportDesk mobile app is not loading, try: (1) force-close and reopen the app, (2) check your internet connection, (3) clear the app cache in device settings, (4) uninstall and reinstall the app. If the problem persists, submit a ticket with your device model and OS version.',
    tags: ['mobile', 'troubleshooting', 'app'],
    created_at: new Date('2026-03-05T00:00:00Z'),
  },
  {
    _id: new ObjectId(),
    title: 'Setting up SSO with SAML',
    body: 'SupportDesk supports SAML 2.0 for single sign-on. To configure, go to Admin > Security > SSO and enter your Identity Provider metadata URL. Supported IdPs include Okta, Azure AD, and Google Workspace. Once enabled, all users in your organization will be required to authenticate via SSO.',
    tags: ['sso', 'saml', 'security', 'access'],
    created_at: new Date('2026-03-18T00:00:00Z'),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const db = await connect();

  const collections = {
    users: usersData,
    products: productsData,
    tickets: ticketsData,
    comments: commentsData,
    knowledge_articles: knowledgeArticlesData,
  };

  for (const [name, docs] of Object.entries(collections)) {
    try {
      if (DROP) {
        await db.collection(name).drop().catch(() => {}); // ignore if doesn't exist
        console.log(`  dropped: ${name}`);
      }

      // Upsert all documents in one batch so the script is safe to re-run without --drop
      const ops = docs.map(doc => ({
        replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
      }));
      if (ops.length > 0) {
        await db.collection(name).bulkWrite(ops);
      }

      console.log(`✓ ${name}: ${docs.length} document(s) seeded`);
    } catch (err) {
      console.error(`✗ ${name}: seed failed — ${err.message}`);
      process.exit(1);
    }
  }

  // Verify collections are seeded correctly
  console.log('\nVerification:');
  for (const name of Object.keys(collections)) {
    const count = await db.collection(name).countDocuments({});
    console.log(`  ${name}: ${count} total documents`);
  }

  // Confirm the intentional starting state
  const sampleTicket = await db.collection('tickets').findOne({});
  const hasEmbeddedUser = sampleTicket && typeof sampleTicket.user === 'object' && !Array.isArray(sampleTicket.user);
  const hasEmbedding = await db.collection('knowledge_articles').findOne({ embedding: { $exists: true } });

  console.log('\nStarting state check (expected: both should be false):');
  console.log(`  Tickets have embedded user: ${hasEmbeddedUser} ${hasEmbeddedUser ? '⚠ already modified?' : '✓'}`);
  console.log(`  knowledge_articles have embeddings: ${!!hasEmbedding} ${hasEmbedding ? '⚠ already modified?' : '✓'}`);

  console.log('\nSeed complete. The lab is ready for the agent.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
