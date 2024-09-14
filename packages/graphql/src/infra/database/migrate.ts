import { DatabaseConnection } from './DatabaseConnection';

async function migrate() {
  const db = DatabaseConnection.getInstance();

  //   await db.query(
  //     `
  //     DROP TABLE indexer.accounts;
  //     `,
  //     [],
  //   );
  //   console.log('Transactions_Accounts table deleted successfully.');
  // Step 15: Create the transactions_accounts table
  await db.query(
    `
    CREATE TABLE indexer.accounts (
      _id SERIAL PRIMARY KEY,
      account_id character varying(66) NOT NULL UNIQUE,
      transaction_count INTEGER NOT NULL DEFAULT 0,
      data jsonb NOT NULL DEFAULT '{}',
      first_transaction_timestamp timestamp without time zone NOT NULL,
      recent_transaction_timestamp timestamp without time zone NOT NULL
  );
    `,
    [],
  );
  console.log('Transactions_Accounts table created successfully.');

  // Step 16: Create indexes for transactions_accounts table
  await db.query(
    `
    CREATE UNIQUE INDEX ON indexer.accounts(_id);
    CREATE UNIQUE INDEX ON indexer.accounts(account_id);
    CREATE INDEX ON indexer.accounts(transaction_count);
    CREATE INDEX ON indexer.accounts(recent_transaction_timestamp);
    CREATE INDEX ON indexer.accounts(first_transaction_timestamp);
    `,
    [],
  );
  console.log('Indexes for transactions_accounts table created successfully.');
}

migrate()
  .catch(console.error)
  .finally(() => process.exit());
