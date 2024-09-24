import { DatabaseConnection } from '../../../src/infra/database/DatabaseConnection';

async function migrate() {
  const db = DatabaseConnection.getInstance();

  await db.query(
    `
    DROP TABLE IF EXISTS indexer.block_statistics;
    `,
    [],
  );
  console.log('Dropped block_statistics table if it existed.');
  // Step 3: Create the blocks table
  await db.query(
    `
    CREATE TABLE indexer.block_statistics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        number_of_blocks INTEGER NOT NULL,
        cumulative_block_reward NUMERIC NOT NULL,
        start_block INTEGER NOT NULL,
        end_block INTEGER NOT NULL
    );
    `,
    [],
  );

  // Step 16: Create indexes for transactions_accounts table
  await db.query(
    `
    CREATE UNIQUE INDEX ON indexer.block_statistics(id);
    CREATE INDEX ON indexer.block_statistics(timestamp);
    `,
    [],
  );
  console.log('Indexes for transactions_accounts table created successfully.');
}

migrate()
  .catch(console.error)
  .finally(() => process.exit());