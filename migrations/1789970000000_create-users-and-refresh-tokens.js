/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    name: {
      type: 'varchar(100)',
      notNull: true,
    },

    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },

    password: {
      type: 'varchar(255)',
      notNull: true,
    },

    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
    },
  });

  pgm.createTable('refresh_tokens', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    token_hash: {
      type: 'varchar(255)',
      notNull: true,
    },

    expires_at: {
      type: 'timestamp',
      notNull: true,
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },

    jti: {
      type: 'varchar(100)',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('refresh_tokens');
  pgm.dropTable('users');
};
