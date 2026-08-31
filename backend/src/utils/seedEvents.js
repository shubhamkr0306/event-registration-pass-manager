const { query, initDb } = require('../config/db');

const seedEvents = async () => {
  try {
    await initDb();

    // 1. Find organizer user
    const organizerRes = await query("SELECT id, name FROM users WHERE email = 'organizer@shnoor.com'");
    if (organizerRes.rows.length === 0) {
      console.log('[Seed Events]: Organizer user not found. Please run seedUsers.js first.');
      process.exit(1);
    }

    const organizerId = organizerRes.rows[0].id;

    // 2. Demo events data
    const sampleEvents = [
      {
        title: 'Global AI & Cloud Summit 2026',
        description: 'Join industry pioneers for keynotes on generative AI models, cloud infrastructure scaling, and real-world enterprise deployments.',
        category: 'Technology',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Bangalore, India',
        venue: 'Grand Tech Convention Centre, Hall A',
        ticket_price: 499.00,
        total_capacity: 200,
        registered_count: 142,
        status: 'ACTIVE',
      },
      {
        title: 'NextGen Full-Stack & DevOps Conference',
        description: 'Deep-dive technical sessions on React 19, Node.js microservices, Docker orchestration, and high-performance databases.',
        category: 'Development',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Hyderabad, India',
        venue: 'Cyber City Auditorium, Sector 4',
        ticket_price: 299.00,
        total_capacity: 150,
        registered_count: 65,
        status: 'UPCOMING',
      },
      {
        title: 'Cybersecurity & Zero Trust Expo',
        description: 'Comprehensive exhibition and hands-on workshops exploring identity access management, cloud security posture, and defense.',
        category: 'Security',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai, India',
        venue: 'Bandra Kurla Complex Arena',
        ticket_price: 0.00,
        total_capacity: 100,
        registered_count: 88,
        status: 'UPCOMING',
      },
    ];

    for (const evt of sampleEvents) {
      const existing = await query(
        'SELECT id FROM events WHERE organizer_id = $1 AND title = $2',
        [organizerId, evt.title]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO events (organizer_id, title, description, category, date, location, venue, ticket_price, total_capacity, registered_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            organizerId,
            evt.title,
            evt.description,
            evt.category,
            evt.date,
            evt.location,
            evt.venue,
            evt.ticket_price,
            evt.total_capacity,
            evt.registered_count,
            evt.status,
          ]
        );
        console.log(`[Seed Events]: Created event -> "${evt.title}"`);
      } else {
        console.log(`[Seed Events]: Event already exists -> "${evt.title}"`);
      }
    }

    console.log('[Seed Events]: All sample events seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Events Error]:', error);
    process.exit(1);
  }
};

seedEvents();
