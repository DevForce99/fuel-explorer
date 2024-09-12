import { Box, Container, Heading, Theme, VStack } from '@fuels/ui';
import { Grid, LineGraph } from '@fuels/ui';
import { useState } from 'react';
import { useEffect } from 'react';
import { tv } from 'tailwind-variants';
import { getBlockStats } from '../actions/getBlocks';
import {
  getCumulativeTransactionStats,
  getTransactionStats,
} from '../actions/getTransactions';
import Hero from '../components/Hero/Hero';
import {
  filterOption,
  getFilterOptionByValue,
  mapTimeRangeFilterToDataValue,
} from '../utils/utils';

import { DateHelper } from '../utils/date';

export const StatisticsScreen = () => {
  const classes = styles();
  const [newBlocksData, setNewBlocksData] = useState<any[]>([]);
  const [averageBlocksData, setAverageBlocksData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [cumulativeTransactionsData, setCumulativeTransactionsData] = useState<
    any[]
  >([]);
  const [dailyTransactionsData, setDailyTransactionsData] = useState<any[]>([]);
  const [cumulativeTransactionsFeeData, setCumulativeTransactionsFeeData] =
    useState<any[]>([]);

  const [blockTimeFilter, setBlockTimeFilter] = useState<filterOption>(
    filterOption.All,
  );
  const [blockAvgTimeFilter, setblockAvgTimeFilter] = useState<filterOption>(
    filterOption.All,
  );
  const [averageTransactionsData, setAverageTransactionsData] = useState<any[]>(
    [],
  );

  const [cumulativeTransactionFilter, setCumulativeTransactionFilter] =
    useState<filterOption>(filterOption.All);
  const [cumulativeTransactionFeeFilter, setCumulativeTransactionFeeFilter] =
    useState<filterOption>(filterOption.All);
  const [averageTransactionsFilter, setAverageTransactionsFilter] =
    useState<filterOption>(filterOption.All);

  const [dailyTransactionsFilter, setdailyTransactionsFilter] =
    useState<filterOption>(filterOption.All);

  const getBlockStatistics = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);

    try {
      const data: any = await getBlockStats({
        timeFilter: displayValue,
      });

      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }

      const transformedData = data
        .map((item: any) => ({
          start: item.start,
          count: item.count,
          totalRewards: item.totalRewards,
        }))
        .reverse();
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  const getStats = async () => {
    let totalTransactions = 0;
    let totalNetworkFee = 0;
    let totalBlock = 0;
    const transactions: any = await getTransactionStats({ timeFilter: null });
    const blocks: any = await getBlockStats({ timeFilter: null });
    console.log('Stats transactions', transactions);
    if (transactions) {
      transactions.map((transaction: any) => {
        totalTransactions += transaction.count;
        totalNetworkFee += transaction.totalFee;
      });
    }
    console.log('bloc transactions', blocks);
    if (blocks) {
      blocks.map((block: any) => {
        totalBlock += block.count;
      });
    }
    return [
      {
        titleProp: 'Transaction',
        valuesProp: totalTransactions,
        timeProp: 'All Time',
      },
      {
        titleProp: 'Transaction Per Second (TPS)',
        valuesProp: '3,299',
        timeProp: 'Last 1 Hour',
      },
      {
        titleProp: 'Total Network Fees (ETH)',
        valuesProp: totalNetworkFee,
        timeProp: 'Last 24h',
      },
      { titleProp: 'Blocks', valuesProp: totalBlock, timeProp: 'All Time' },
    ];
  };

  useEffect(() => {
    getStats().then((value: any) => {
      setStats(value);
    });
  }, [stats]);

  const getTransactionStatistics = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getTransactionStats({
        timeFilter: displayValue,
      });

      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data
        .map((item: any) => ({
          start: item.start,
          count: item.count,
          totalRewards: item.totalFee,
        }))
        .reverse();
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };
  const getCumulativeTransactionStatistics = async (
    selectedFilter: filterOption,
  ) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getCumulativeTransactionStats({
        timeFilter: displayValue,
      });
      console.log(data);
      if (!Array.isArray(data?.transactions)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.transactions
        .map((item: any) => ({
          start: item.start,
          count: item.count,
          rewards: item.totalFee,
        }))
        .reverse();
      transformedData.push({
        start: DateHelper.getPreviousDayDate(),
        count: 0,
        rewards: 0,
      });
      console.log('Transformed Data is', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  useEffect(() => {
    getBlockStatistics(blockTimeFilter).then((value: any) => {
      setNewBlocksData(value);
    });
  }, [blockTimeFilter]);

  useEffect(() => {
    getTransactionStatistics(dailyTransactionsFilter).then((value: any) => {
      console.log('Here is the value', value);
      setDailyTransactionsData(value);
    });
  }, [dailyTransactionsFilter]);

  useEffect(() => {
    getTransactionStatistics(averageTransactionsFilter).then((value: any) => {
      console.log('Here is the average transaction data', value);
      const transformedData = Array.isArray(value)
        ? value.map((item: any) => {
            const totalFeeSpent = Number(item.totalRewards) || 0;
            const totalCount = Number(item.count) || 1;
            const totalFeeInEth = totalFeeSpent / 10 ** 9;
            const average = totalCount ? totalFeeInEth / totalCount : 0;
            return {
              start: item.start,
              count: average.toFixed(9),
            };
          })
        : [];

      setAverageTransactionsData(transformedData);
    });
  }, [averageTransactionsFilter]);

  useEffect(() => {
    getCumulativeTransactionStatistics(cumulativeTransactionFilter).then(
      (value: any) => {
        console.log('Here is the value', value);
        setCumulativeTransactionsData(value);
      },
    );
  }, [cumulativeTransactionFilter]);

  useEffect(() => {
    getCumulativeTransactionStatistics(cumulativeTransactionFeeFilter).then(
      (value: any) => {
        console.log('Transactional Fee value', value);
        const transformedData = Array.isArray(value)
          ? value.map((item: any) => {
              const totalFeeSpent = Number(item.rewards) || 0;
              const averageRewardInETH = totalFeeSpent / 10 ** 9;
              return {
                start: item.start,
                count: averageRewardInETH.toFixed(9),
              };
            })
          : [];
        setCumulativeTransactionsFeeData(transformedData);
      },
    );
  }, [cumulativeTransactionFeeFilter]);

  //For Average Block
  useEffect(() => {
    getBlockStatistics(blockAvgTimeFilter).then((value: any) => {
      const transformedData = Array.isArray(value)
        ? value.map((item: any) => {
            const count = Number(item.count) || 1;
            const averageReward = (Number(item.totalRewards) || 0) / count;
            const averageRewardInETH = averageReward / 10 ** 9;
            return {
              start: item.start,
              count: averageRewardInETH.toFixed(9),
            };
          })
        : [];
      setAverageBlocksData(transformedData);
    });
  }, [blockAvgTimeFilter]);

  return (
    <Theme appearance="light">
      <Box className={classes.root()}>
        <Container className={classes.container()}>
          <VStack>
            <Heading as="h1" className={classes.title()}>
              Statistics
            </Heading>
            <div className="pb-6">
              <Hero stats={stats} />
            </div>
          </VStack>

          <div className="text-heading text-md font-mono my-20">
            <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
              Blocks
            </h2>
            <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LineGraph
                dataProp={newBlocksData}
                titleProp={'New Block'}
                selectedTimeRange={blockTimeFilter}
                timeRangeOptions={Object.values(filterOption) as []}
                onTimeRangeChange={(days) => {
                  setBlockTimeFilter(getFilterOptionByValue(days));
                }}
              />

              <LineGraph
                dataProp={averageBlocksData}
                titleProp={'Avg. Block Reward'}
                selectedTimeRange={blockAvgTimeFilter}
                timeRangeOptions={Object.values(filterOption) as []}
                valueUnit={'ETH'}
                onTimeRangeChange={(days) => {
                  setblockAvgTimeFilter(getFilterOptionByValue(days));
                }}
              />
            </Grid>
          </div>

          <div className="text-heading text-md font-mono my-20">
            <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
              Transactions
            </h2>
            <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LineGraph
                dataProp={cumulativeTransactionsData}
                titleProp={'Total Transactions (Cumulative)'}
                selectedTimeRange={cumulativeTransactionFilter}
                timeRangeOptions={Object.values(filterOption) as []}
                onTimeRangeChange={(days) => {
                  setCumulativeTransactionFilter(getFilterOptionByValue(days));
                }}
              />
              <LineGraph
                dataProp={dailyTransactionsData}
                titleProp={'Daily Transactions'}
                selectedTimeRange={dailyTransactionsFilter}
                timeRangeOptions={Object.values(filterOption) as []}
                onTimeRangeChange={(days) => {
                  setdailyTransactionsFilter(getFilterOptionByValue(days));
                }}
              />
              <LineGraph
                dataProp={cumulativeTransactionsFeeData}
                valueUnit={'ETH'}
                titleProp={'Transaction Fee Spent (Cumilative)'}
                timeRangeOptions={Object.values(filterOption) as []}
                selectedTimeRange={cumulativeTransactionFeeFilter}
                onTimeRangeChange={(days) => {
                  setCumulativeTransactionFeeFilter(
                    getFilterOptionByValue(days),
                  );
                }}
              />
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'Avg. Transactions Fee'}
                valueUnit={'ETH'}
                timeRangeOptions={Object.values(filterOption) as []}
                selectedTimeRange={averageTransactionsFilter}
                onTimeRangeChange={(days) => {
                  setAverageTransactionsFilter(getFilterOptionByValue(days));
                }}
              />
            </Grid>
          </div>

          <div className="text-heading text-md font-mono my-20">
            <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
              Accounts
            </h2>
            {/* <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'Total Active (Cumilative)'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'Daily Active Accounts'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'New Accounts'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
            </Grid> */}
          </div>

          <div className="text-heading text-md font-mono my-20">
            <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
              Tokens
            </h2>
            {/* <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'Total Tokens (Cumilative)'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'New Tokens'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
            </Grid> */}
          </div>

          <div className="text-heading text-md font-mono my-10">
            <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
              NFTs
            </h2>
            {/* <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'Total NFTs (Cumilative)'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
              <LineGraph
                dataProp={averageTransactionsData}
                titleProp={'New NFTs'}
                selectedDays={averageTransactionsTimeStamp}
                setSelectedDays={setAverageTransactionsTimeStamp}
              />
            </Grid> */}
          </div>
        </Container>
      </Box>
    </Theme>
  );
};

const styles = tv({
  slots: {
    root: 'overflow-clip relative w-full border-border bg-gray-3 dark:bg-gray-1',
    container: [
      // 'z-20 relative py-8 pt-6 px-8 tablet:pt-18 tablet:px-10',
      // 'tablet:max-laptop:max-w-[500px] [&_.rt-ContainerInner]:p-2',
      ' [&_.rt-ContainerInner]:tablet:max-laptop:bg-opacity-60 [&_.rt-ContainerInner]:tablet:max-laptop:rounded-lg [&_.rt-ContainerInner]:tablet:max-laptop:shadow-2xl',
    ],
    input: 'w-full tablet:w-[400px]',
    title: [
      'text-2xl leading-snug text-heading justify-center',
      'tablet:text-left tablet:text-4xl tablet:justify-start',
    ],
    subtitle: ['text-base mb-8 justify-center'],
    searchWrapper: 'grid grid-cols-12 grid-rows-auto auto-rows-min gap-5',
  },
});
