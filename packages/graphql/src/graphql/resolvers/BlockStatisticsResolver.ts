import BlockDAO from '../../infra/dao/BlockDAO';

export class BlockStatisticsResolver {
  static create() {
    const resolvers = new BlockStatisticsResolver();
    return {
      Query: {
        blockStatistics: resolvers.getBlockStatistics,
      },
    };
  }

  async getBlockStatistics(
    _: any,
    { startDate, endDate }: { startDate: string; endDate: string },
  ) {
    const blockDAO = new BlockDAO();

    const statistics = await blockDAO.getBlockStatisticsInRange(
      startDate,
      endDate,
    );

    return {
      nodes: statistics.map((stat: any) => ({
        timestamp: stat.timestamp,
        numberOfBlocks: stat.number_of_blocks,
        cumulativeBlockReward: stat.cumulative_block_reward,
        startBlock: stat.start_block,
        endBlock: stat.end_block,
      })),
    };
  }
}
