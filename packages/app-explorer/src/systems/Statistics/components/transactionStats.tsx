import { Grid, LineGraph, LoadingBox, LoadingWrapper } from '@fuels/ui';
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
  const [dailyTransactionFeeData, setdailyTransactionFeeData] = useState<any[]>(
    [],
  );
  const [averageTransactionsData, setAverageTransactionsData] = useState<any[]>(
    [],
  );

  const [cumulativeTransactionFilter, setCumulativeTransactionFilter] =
    useState<filterOption>(filterOption.d7);
  const [cumulativeTransactionFeeFilter, setCumulativeTransactionFeeFilter] =
    useState<filterOption>(filterOption.d7);
  const [averageTransactionsFilter, setAverageTransactionsFilter] =
    useState<filterOption>(filterOption.d7);
  const [dailyTransactionsFilter, setdailyTransactionsFilter] =
    useState<filterOption>(filterOption.d7);

  const [isLoadingDailyTransactions, setIsLoadingDailyTransactions] =
    useState(true);
  const [
    isLoadingdailyTransactionFeeData,
    setIsLoadingdailyTransactionFeeData,
  ] = useState(true);
  const [
    isLoadingCumulativeTransactionsData,
    setIsLoadingCumulativeTransactionsData,
  ] = useState(true);
  const [
    isLoadingAverageTransactionsData,
    setIsLoadingAverageTransactionsData,
  ] = useState(true);

  const getTransactionStatistics = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getTransactionStats({
        timeFilter: displayValue,
      });

      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.map((item: any) => ({
        start: item.start,
        count: item.count,
        totalRewards: item.totalFee,
      }));

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

      if (!Array.isArray(data?.transactions)) {
        throw new Error('Expected data to be an array');
      }

      let previousCount = +data?.offset ?? 0;

      const transformedData = data.transactions.map((item: any) => {
        const currentCount = previousCount + item.count;
        const result = {
          start: item.start,
          count: currentCount,
          rewards: item.totalFee,
        };
        previousCount = currentCount;
        return result;
      });

      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  useEffect(() => {
    setIsLoadingDailyTransactions(true);
    getTransactionStatistics(dailyTransactionsFilter).then((value: any) => {
      setDailyTransactionsData(value);
      setIsLoadingDailyTransactions(false);
    });
  }, [dailyTransactionsFilter]);

  useEffect(() => {
    setIsLoadingAverageTransactionsData(true);
    getTransactionStatistics(averageTransactionsFilter).then((value: any) => {
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
      setIsLoadingAverageTransactionsData(false);
    });
  }, [averageTransactionsFilter]);

  useEffect(() => {
    setIsLoadingCumulativeTransactionsData(true);
    getCumulativeTransactionStatistics(cumulativeTransactionFilter).then(
      (value: any) => {
        setCumulativeTransactionsData(value);
        setIsLoadingCumulativeTransactionsData(false);
      },
    );
  }, [cumulativeTransactionFilter]);

  useEffect(() => {
    setIsLoadingdailyTransactionFeeData(true);
    getCumulativeTransactionStatistics(cumulativeTransactionFeeFilter).then(
      (value: any) => {
        const transformedData = Array.isArray(value)
          ? value.map((item: any) => {
              const totalFeeSpent = Number(item.rewards) || 0;
              const feeInEth = totalFeeSpent / 10 ** 9;
              return {
                start: item.start,
                count: feeInEth.toFixed(9),
              };
            })
          : [];
        setdailyTransactionFeeData(transformedData);
        setIsLoadingdailyTransactionFeeData(false);
      },
    );
  }, [cumulativeTransactionFeeFilter]);
  const totalCount = averageTransactionsData.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  const averageCount = totalCount / averageTransactionsData.length || 0; // Ensure there's no division by zero

  return (
    <div className="text-heading text-md font-mono my-20">
      <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
        Transactions
      </h2>
      <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LoadingWrapper
          isLoading={isLoadingCumulativeTransactionsData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={cumulativeTransactionsData}
              titleProp={'Total Transactions (Cumulative)'}
              selectedTimeRange={cumulativeTransactionFilter}
              defaultSelectedValue={cumulativeTransactionsData.at(-1)?.count}
              timeRangeOptions={Object.values(filterOption) as []}
              onTimeRangeChange={(days) => {
                setCumulativeTransactionFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />

        <LoadingWrapper
          isLoading={isLoadingDailyTransactions}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={dailyTransactionsData}
              titleProp={'Daily Transactions'}
              selectedTimeRange={dailyTransactionsFilter}
              defaultSelectedValue={dailyTransactionsData.at(-1)?.count}
              timeRangeOptions={Object.values(filterOption) as []}
              onTimeRangeChange={(days) => {
                setdailyTransactionsFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />

        <LoadingWrapper
          isLoading={isLoadingdailyTransactionFeeData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={dailyTransactionFeeData}
              valueUnit={'ETH'}
              titleProp={'Daily Transaction Fee Spent'}
              timeRangeOptions={Object.values(filterOption) as []}
              selectedTimeRange={cumulativeTransactionFeeFilter}
              defaultSelectedValue={dailyTransactionFeeData[0]?.count}
              onTimeRangeChange={(days) => {
                setCumulativeTransactionFeeFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />
        <LoadingWrapper
          isLoading={isLoadingAverageTransactionsData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={averageTransactionsData}
              titleProp={'Avg. Transactions Fee'}
              valueUnit={'ETH'}
              timeRangeOptions={Object.values(filterOption) as []}
              selectedTimeRange={averageTransactionsFilter}
              defaultSelectedValue={averageCount.toFixed(9)}
              onTimeRangeChange={(days) => {
                setAverageTransactionsFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />
      </Grid>
    </div>
  );
};

export default TransactionStats;
