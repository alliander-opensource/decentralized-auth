exports.up = knex =>
  knex.schema.createTable('policy', (t) => {
    t.string('id').primary().notNull();
    t.json('policy').notNull();
    t.string('deviceId').index().references('id').inTable('device');
    t.string('message').notNull();
    t.json('serviceProvider').notNull();
    t.jsonb('owner').notNull();
    t.dateTime('created_at').notNull().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').notNull().defaultTo(knex.raw('now()'));
  });

exports.down = knex =>
  knex.schema.dropTable('policy');
