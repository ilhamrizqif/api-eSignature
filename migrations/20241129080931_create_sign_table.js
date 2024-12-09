exports.up = function (knex) {
  return knex.schema.createTable('sign', (table) => {
    table.increments('id').primary();
    table.text('img').notNullable();
    table.string('status').notNullable();
    table.string('label').notNullable();
    table.string('name').notNullable().defaultTo('');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sign');
};
