import { Grid, LineGraph } from '@fuels/ui';
import React, { useState, useEffect } from 'react';
import {
  getCumulativeTransactionStats,
  getTransactionStats,
} from '../actions/getTransactions';
import {
  filterOption,
  getFilterOptionByValue,
  mapTimeRangeFilterToDataValue,
} from '../utils/utils';

const TransactionStats = () => {
  const [cumulativeTransactionsData, setCumulativeTransactionsData] = useState<
    any[]
  >([]);
  const [dailyTransactionsData, setDailyTransactionsData] = useState<any[]>([]);
  const [cumulativeTransactionsFeeData, setCumulativeTransactionsFeeData] =
    useState<any[]>([]);
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
          count: item.count + data.offset,
          rewards: item.totalFee,
        }))
        .reverse();
      console.log('Transformed Data is', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

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

  return (
    <div className="text-heading text-md font-mono my-20">
      <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
        Transactions
      </h2>
      <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LineGraph
          dataProp={cumulativeTransactionsData}
          titleProp={'Total Transactions (Cumulative)'}
          selectedTimeRange={cumulativeTransactionFilter}
          defaultSelectedValue={cumulativeTransactionsData[0]?.count}
          timeRangeOptions={Object.values(filterOption) as []}
          onTimeRangeChange={(days) => {
            setCumulativeTransactionFilter(getFilterOptionByValue(days));
          }}
        />
        <LineGraph
          dataProp={dailyTransactionsData}
          titleProp={'Daily Transactions'}
          selectedTimeRange={dailyTransactionsFilter}
          defaultSelectedValue={dailyTransactionsData[0]?.count}
          timeRangeOptions={Object.values(filterOption) as []}
          onTimeRangeChange={(days) => {
            setdailyTransactionsFilter(getFilterOptionByValue(days));
          }}
        />
        <LineGraph
          dataProp={cumulativeTransactionsFeeData}
          valueUnit={'ETH'}
          titleProp={'Daily Transaction Fee Spent (Cumilative)'}
          timeRangeOptions={Object.values(filterOption) as []}
          selectedTimeRange={cumulativeTransactionFeeFilter}
          defaultSelectedValue={cumulativeTransactionsFeeData[0]?.count}
          onTimeRangeChange={(days) => {
            setCumulativeTransactionFeeFilter(getFilterOptionByValue(days));
          }}
        />
        <LineGraph
          dataProp={averageTransactionsData}
          titleProp={'Avg. Transactions Fee'}
          valueUnit={'ETH'}
          timeRangeOptions={Object.values(filterOption) as []}
          selectedTimeRange={averageTransactionsFilter}
          defaultSelectedValue={averageTransactionsData[0]?.count}
          onTimeRangeChange={(days) => {
            setAverageTransactionsFilter(getFilterOptionByValue(days));
          }}
        />
      </Grid>
    </div>
  );
};

export default TransactionStats;
