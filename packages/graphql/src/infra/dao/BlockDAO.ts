import { DatabaseConnection } from '../database/DatabaseConnection';
import PaginatedParams from '../paginator/PaginatedParams';
import Block from './Block';

export default class BlockDAO {
  databaseConnection: DatabaseConnection;

  constructor() {
    this.databaseConnection = DatabaseConnection.getInstance();
  }

  async getByHeight(height: number) {
    const blockData = (
      await this.databaseConnection.query(
        `
		  select
			  b.*
		  from
			  indexer.blocks b
		  where
			  b._id = $1
		  `,
        [height],
      )
    )[0];
    if (!blockData) return;
    return new Block(blockData);
  }

  async getByHash(hash: string) {
    const blockData = (
      await this.databaseConnection.query(
        `
		  select
			  b.*
		  from
			  indexer.blocks b
		  where
			  b.id = $1
		  `,
        [hash],
      )
    )[0];
    if (!blockData) return;
    return new Block(blockData);
  }

  async getPaginatedBlocks(paginatedParams: PaginatedParams) {
    const direction = paginatedParams.direction === 'before' ? '<' : '>';
    const order = paginatedParams.direction === 'before' ? 'desc' : 'asc';
    const blocksData = await this.databaseConnection.query(
      `
		select 
			*
		from 
			indexer.blocks b
		where
			$1::integer is null or b._id ${direction} $1
		order by
			b._id ${order} 
		limit 10
	`,
      [paginatedParams.cursor],
    );
    blocksData.sort((a: any, b: any) => {
      return (a._id - b._id) * -1;
    });
    const blocks = [];
    for (const blockData of blocksData) {
      blocks.push(new Block(blockData));
    }
    if (blocks.length === 0) {
      return {
        nodes: [],
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          endCursor: '',
          startCursor: '',
        },
      };
    }
    const startCursor = blocksData[0]._id;
    const endCursor = blocksData[blocksData.length - 1]._id;
    const hasPreviousPage = (
      await this.databaseConnection.query(
        'select exists(select 1 from indexer.blocks where _id < $1)',
        [endCursor],
      )
    )[0].exists;
    const hasNextPage = (
      await this.databaseConnection.query(
        'select exists(select 1 from indexer.blocks where _id > $1)',
        [startCursor],
      )
    )[0].exists;
    const newNodes = blocks.map((n) => n.toGQLNode());
    const edges = newNodes.map((node) => ({
      node,
      cursor: paginatedParams.cursor,
    }));
    const paginatedResults = {
      nodes: newNodes,
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        endCursor,
        startCursor,
      },
    };
    return paginatedResults;
  }

  async findLatestBlockAdded() {
    const [blockData] = await this.databaseConnection.query(
      'select * from indexer.blocks order by _id desc limit 1',
      [],
    );
    if (!blockData) return;
    return new Block(blockData);
  }

  async getBlocksInRange(startTimestamp: string, endTimestamp: string) {
    const blocksData = await this.databaseConnection.query(
      `
        SELECT 
          _id, 
          timestamp, 
          (jsonb_array_elements(data->'transactions')->>'mintAmount')::numeric AS reward
        FROM 
          indexer.blocks
        WHERE 
          timestamp >= $1 AND timestamp < $2
        ORDER BY timestamp ASC
      `,
      [startTimestamp, endTimestamp],
    );
    return blocksData;
  }

  async insertBlockStatistics(
    timestamp: string,
    numberOfBlocks: number,
    cumulativeBlockReward: number,
    startBlock: number,
    endBlock: number,
  ) {
    await this.databaseConnection.query(
      `
        INSERT INTO indexer.block_statistics (timestamp, number_of_blocks, cumulative_block_reward, start_block, end_block)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [timestamp, numberOfBlocks, cumulativeBlockReward, startBlock, endBlock],
    );
  }

  async findLatestStatisticsTimestamp() {
    const [result] = await this.databaseConnection.query(
      `
        SELECT timestamp FROM indexer.block_statistics
        ORDER BY timestamp DESC
        LIMIT 1
      `,
      [],
    );
    return result ? result.timestamp : null;
  }

  async getBlockStatisticsInRange(
    startTimestamp: string,
    endTimestamp: string,
  ) {
    const statsData = await this.databaseConnection.query(
      `
        SELECT * FROM indexer.block_statistics
        WHERE timestamp >= $1 AND timestamp < $2
        ORDER BY timestamp ASC
      `,
      [startTimestamp, endTimestamp],
    );
    return statsData;
  }

  async getEarliestBlockTimestamp(): Promise<string> {
    const [result] = await this.databaseConnection.query(
      `
      SELECT timestamp
      FROM indexer.blocks
      ORDER BY timestamp ASC
      LIMIT 1
      `,
      [],
    );
    return result ? result.timestamp : null;
  }
}
