import { AccountEntity } from '../../domain/Account/AccountEntity';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { getTimeInterval } from './utils';

export default class AccountDAO {
  private databaseConnection: DatabaseConnection;

  constructor() {
    this.databaseConnection = DatabaseConnection.getInstance();
  }

  // Custom function to stringify BigInt values
  private stringifyBigInt(data: any): string {
    return JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    );
  }

  async save(account: AccountEntity) {
    const accountData = AccountEntity.toDBItem(account);

    const data = this.stringifyBigInt(accountData.data);

    // Use raw SQL query to insert or update the account record
    await this.databaseConnection.query(
      `
      INSERT INTO indexer.accounts (account_id, transaction_count, data, first_transaction_timestamp, recent_transaction_timestamp)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (account_id)
      DO UPDATE SET
        transaction_count = EXCLUDED.transaction_count,
        data = EXCLUDED.data,
        recent_transaction_timestamp = CASE
          WHEN accounts.transaction_count <> EXCLUDED.transaction_count THEN EXCLUDED.recent_transaction_timestamp
          ELSE accounts.recent_transaction_timestamp
        END
      `,
      [
        accountData.account_id,
        accountData.transaction_count,
        data,
        accountData.first_transaction_timestamp || new Date().toISOString(),
        new Date().toISOString(),
      ],
    );
  }

  async getAccountById(id: string): Promise<AccountEntity | null> {
    const result = await this.databaseConnection.query(
      `
      SELECT * FROM indexer.accounts WHERE account_id = $1
      `,
      [id],
    );

    return result.length ? AccountEntity.create(result[0]) : null;
  }

  async incrementTransactionCount(account_id: string, incrementBy = 1) {
    await this.databaseConnection.query(
      `
    UPDATE indexer.accounts
    SET transaction_count = transaction_count + $1,
        recent_transaction_timestamp = $2
    WHERE account_id = $3
    `,
      [incrementBy, new Date().toISOString(), account_id],
    );
  }

  // Updated method to update account data with BigInt handling
  async updateAccountData(account_id: string, newData: any) {
    const data = this.stringifyBigInt(newData); // Use custom function for BigInt serialization

    await this.databaseConnection.query(
      `
      UPDATE indexer.accounts
      SET data = $1,
          recent_transaction_timestamp = $2
      WHERE account_id = $3
      `,
      [data, new Date().toISOString(), account_id],
    );
  }

  async updateAccountTransactionCount(
    account_id: string,
    newTransactionCount: number,
  ) {
    await this.databaseConnection.query(
      `
      UPDATE indexer.accounts
      SET transaction_count = $1,
          recent_transaction_timestamp = $2
      WHERE account_id = $3
      `,
      [newTransactionCount, new Date().toISOString(), account_id],
    );
  }

  // New method to get account data content
  async getAccountDataContent(account_id: string): Promise<any | null> {
    const result = await this.databaseConnection.query(
      `
      SELECT data FROM indexer.accounts WHERE account_id = $1
      `,
      [account_id],
    );

    return result.length ? result[0].data : null;
  }

  async accountCreationStatistics(timeFilter: string) {
    const _interval = getTimeInterval(timeFilter);

    let query = `
      SELECT 
        first_transaction_timestamp AS timestamp
      FROM indexer.accounts
    `;

    let intervalStartTimeDate = '';

    if (_interval) {
      const intervalStartTimeInMilliseconds = Date.now() - _interval;
      intervalStartTimeDate = new Date(
        intervalStartTimeInMilliseconds,
      ).toISOString();

      // Add the WHERE clause, parameterizing the date value to ensure proper handling
      query += 'WHERE first_transaction_timestamp >= $1';
    }

    query += ' ORDER BY timestamp ASC';

    // Execute the main query with the interval start date as a parameter
    const accountsData = await this.databaseConnection.query(query, [
      intervalStartTimeDate,
    ]);

    // Calculate accountOffset: Accounts created before the first timestamp in the interval
    const offsetQuery = `
      SELECT COUNT(*) as "accountOffset"
      FROM indexer.accounts
      WHERE first_transaction_timestamp < $1
    `;

    const offsetResult = await this.databaseConnection.query(offsetQuery, [
      intervalStartTimeDate,
    ]);

    return {
      nodes: accountsData,
      accountOffset: offsetResult[0].accountOffset || 0,
    };
  }

  async newAccountStatistics(timeFilter: string) {
    const _interval = getTimeInterval(timeFilter);

    let query = `
      SELECT 
        first_transaction_timestamp AS timestamp
      FROM indexer.accounts
    `;
    // Prepare interval start time as a valid ISO string
    let intervalStartTimeDate = '';

    if (_interval) {
      const intervalStartTimeInMilliseconds = Date.now() - _interval;
      intervalStartTimeDate = new Date(
        intervalStartTimeInMilliseconds,
      ).toISOString();

      // Add the WHERE clause, parameterizing the date value to ensure proper handling
      query += 'WHERE first_transaction_timestamp >= $1';
    }

    query += ' ORDER BY timestamp ASC';

    // Execute the main query with the interval start date as a parameter
    const accountsData = await this.databaseConnection.query(query, [
      intervalStartTimeDate,
    ]);

    return {
      nodes: accountsData,
      count: accountsData.length,
    };
  }
}
