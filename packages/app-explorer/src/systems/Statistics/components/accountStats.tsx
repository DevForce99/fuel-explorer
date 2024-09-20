import { Grid, LineGraph, LoadingBox, LoadingWrapper } from '@fuels/ui';
import React, { useState, useEffect } from 'react';

import {
  getCumulativeAccountStats,
  getDailyActiveAccountStatsAction,
  getNewAccountStats,
} from '../getAccounts';
import {
  filterOption,
  getFilterOptionByValue,
  mapTimeRangeFilterToDataValue,
} from '../utils/utils';

const TransaccountStats = () => {
  const [cumulativeAccountsData, setCumulativeAccountsData] = useState<any[]>(
    [],
  );
  const [newAccountsData, setNewAccountsData] = useState<any[]>([]);
  const [dailyAccountsData, setDailyAccountsData] = useState<any[]>([]);

  const [cumulativeAccountFilter, setCumulativeAccountFilter] =
    useState<filterOption>(filterOption.d7);
  const [newAccountsFilter, setNewAccountsFilter] = useState<filterOption>(
    filterOption.d7,
  );
  const [dailyAccountsDataFilter, setDailyAccountsDataFilter] =
    useState<filterOption>(filterOption.d7);

  const [isLoadingNewAccountsData, setIsLoadingNewAccountsData] =
    useState(true);
  const [isLoadingCumulativeAccountsData, setIsLoadingCumulativeAccountsData] =
    useState(true);
  const [isLoadingDailyAccountsData, setIsLoadingDailyAccountsData] =
    useState(true);

  const getNewAccountStatistics = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getNewAccountStats({
        timeFilter: displayValue,
      });

      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.map((item: any) => ({
        start: item.start,
        count: item.count,
        dailyRewards: item.dailyFee,
      }));
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  const getCumulativeAccountStatistics = async (
    selectedFilter: filterOption,
  ) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getCumulativeAccountStats({
        timeFilter: displayValue,
      });

      if (!Array.isArray(data.accounts)) {
        throw new Error('Expected data to be an array');
      }
      let previousCount = data.offset ?? 0;
      const transformedData = data.accounts.map((item: any) => {
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
      console.error('Error fetching or processing account statistics:', error);
      return [];
    }
  };

  const getDailyAccountsData = async (selectedFilter: filterOption) => {
    const _displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getDailyActiveAccountStatsAction({
        timeFilter: _displayValue,
      });
      console.log(data);
      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.map((item: any) => ({
        start: item.start,
        count: item.count,
        rewards: item.dailyFee,
      }));

      console.log('Transformed Data is', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  useEffect(() => {
    setIsLoadingNewAccountsData(true);
    getNewAccountStatistics(newAccountsFilter).then((value: any) => {
      console.log('Here is the value', value);
      setNewAccountsData(value);
      setIsLoadingNewAccountsData(false);
    });
  }, [newAccountsFilter]);

  useEffect(() => {
    setIsLoadingCumulativeAccountsData(true);
    getCumulativeAccountStatistics(cumulativeAccountFilter).then(
      (value: any) => {
        console.log('Here is the value', value);
        setCumulativeAccountsData(value);
        setIsLoadingCumulativeAccountsData(false);
      },
    );
  }, [cumulativeAccountFilter]);

  useEffect(() => {
    setIsLoadingDailyAccountsData(true);
    getDailyAccountsData(dailyAccountsDataFilter).then((value: any) => {
      console.log('Here is the value', value);
      setDailyAccountsData(value);
      setIsLoadingDailyAccountsData(false);
    });
  }, [dailyAccountsDataFilter]);

  return (
    <div className="text-heading text-md font-mono my-20">
      <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
        Accounts
      </h2>
      <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LoadingWrapper
          isLoading={isLoadingCumulativeAccountsData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={cumulativeAccountsData}
              titleProp={'Total Accounts (Cumulative)'}
              selectedTimeRange={cumulativeAccountFilter}
              defaultSelectedValue={cumulativeAccountsData.at(-1)?.count}
              timeRangeOptions={Object.values(filterOption) as []}
              onTimeRangeChange={(days) => {
                setCumulativeAccountFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />

        <LoadingWrapper
          isLoading={isLoadingDailyAccountsData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={dailyAccountsData}
              titleProp={'Daily Active Accounts'}
              selectedTimeRange={dailyAccountsDataFilter}
              defaultSelectedValue={dailyAccountsData.reduce(
                (total, item) => total + item.count,
                0,
              )}
              timeRangeOptions={Object.values(filterOption) as []}
              onTimeRangeChange={(days) => {
                setDailyAccountsDataFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />

        <LoadingWrapper
          isLoading={isLoadingNewAccountsData}
          loadingEl={
            <div className="flex items-center justify-center w-full">
              <LoadingBox className="w-[40rem] h-[25rem]" />
            </div>
          }
          regularEl={
            <LineGraph
              dataProp={newAccountsData}
              titleProp={'New Accounts'}
              timeRangeOptions={Object.values(filterOption) as []}
              selectedTimeRange={newAccountsFilter}
              defaultSelectedValue={newAccountsData.reduce(
                (total, item) => total + item.count,
                0,
              )}
              onTimeRangeChange={(days) => {
                setNewAccountsFilter(getFilterOptionByValue(days));
              }}
            />
          }
        />
      </Grid>
    </div>
  );
};

export default TransaccountStats;
