exports.up = knex =>
  knex.schema.createTable('device', (t) => {
    t.string('id').primary().notNull();
    t.json('device').notNull();
    t.string('iotaAddress').notNull();
    t.string('type').notNull();
    t.string('mamRoot').notNull();
    t.string('mamSideKey').notNull();
    t.jsonb('owner');
    t.dateTime('created_at').notNull().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').notNull().defaultTo(knex.raw('now()'));
  });

exports.down = knex =>
  knex.schema.dropTable('device');
