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

  const [isLoadingDailyTransactions, setIsLoadingDailyTransactions] =
    useState(true);
  const [
    isLoadingCumulativeTransactionsFeeData,
    setIsLoadingCumulativeTransactionsFeeData,
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
    setIsLoadingDailyTransactions(true);
    getTransactionStatistics(dailyTransactionsFilter).then((value: any) => {
      console.log('Here is the value', value);
      setDailyTransactionsData(value);
      setIsLoadingDailyTransactions(false);
    });
  }, [dailyTransactionsFilter]);

  useEffect(() => {
    setIsLoadingAverageTransactionsData(true);
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
      setIsLoadingAverageTransactionsData(false);
    });
  }, [averageTransactionsFilter]);

  useEffect(() => {
    setIsLoadingCumulativeTransactionsData(true);
    getCumulativeTransactionStatistics(cumulativeTransactionFilter).then(
      (value: any) => {
        console.log('Here is the value', value);
        setCumulativeTransactionsData(value);
        setIsLoadingCumulativeTransactionsData(false);
      },
    );
  }, [cumulativeTransactionFilter]);

  useEffect(() => {
    setIsLoadingCumulativeTransactionsFeeData(true);
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
        setIsLoadingCumulativeTransactionsFeeData(false);
      },
    );
  }, [cumulativeTransactionFeeFilter]);

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
          isLoading={isLoadingCumulativeTransactionsFeeData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
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
              defaultSelectedValue={averageTransactionsData[0]?.count}
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
