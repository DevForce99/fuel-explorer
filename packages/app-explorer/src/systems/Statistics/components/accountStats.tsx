import { Grid, LineGraph } from '@fuels/ui';
import React, { useState, useEffect } from 'react';
// import {
//   getCumulativeTransaccountStats,
//   getTransaccountStats,
// } from '../accounts/getTransaccounts';

// import { getAccountStats, getCumulativeAccountStats } from '../accounts/getAccounts';
import {
  getAccountStats,
  getCumulativeAccountStats,
  getDailyAccountCreationStats,
} from '../actions/getAccounts';
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
    useState<filterOption>(filterOption.All);
  const [newAccountsFilter, setnewAccountsFilter] = useState<filterOption>(
    filterOption.All,
  );
  const [dailyAccountsDataFilter, setDailyAccountsDataFilter] =
    useState<filterOption>(filterOption.All);

  const getNewAccountStatistics = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    console.log('get new account display value', displayValue);
    try {
      const data: any = await getDailyAccountCreationStats({
        timeFilter: null,
      });
      console.log('The dat of new account creation is ', data);

      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data
        .map((item: any) => ({
          start: item.start,
          count: item.count,
          dailyRewards: item.dailyFee,
        }))
        .reverse();
      console.log(transformedData);
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
      console.log(data);
      if (!Array.isArray(data?.transaccounts)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.transaccounts
        .map((item: any) => ({
          start: item.start,
          count: item.count + data.offset,
          rewards: item.dailyFee,
        }))
        .reverse();
      console.log('Transformed Data is', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching or processing block statistics:', error);
      return [];
    }
  };

  const getDailyAccountsData = async (selectedFilter: filterOption) => {
    const displayValue = mapTimeRangeFilterToDataValue(selectedFilter);
    try {
      const data: any = await getAccountStats({
        timeFilter: displayValue,
      });
      console.log(data);
      if (!Array.isArray(data?.transaccounts)) {
        throw new Error('Expected data to be an array');
      }
      const transformedData = data.transaccounts
        .map((item: any) => ({
          start: item.start,
          count: item.count,
          rewards: item.dailyFee,
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
    getNewAccountStatistics(newAccountsFilter).then((value: any) => {
      console.log('Here is the value', value);
      setNewAccountsData(value);
    });
  }, [newAccountsFilter]);

  useEffect(() => {
    getCumulativeAccountStatistics(cumulativeAccountFilter).then(
      (value: any) => {
        console.log('Here is the value', value);
        setCumulativeAccountsData(value);
      },
    );
  }, [cumulativeAccountFilter]);

  useEffect(() => {
    getDailyAccountsData(dailyAccountsDataFilter).then((value: any) => {
      console.log('Here is the value', value);
      setDailyAccountsData(value);
    });
  }, [dailyAccountsDataFilter]);

  return (
    <div className="text-heading text-md font-mono my-20">
      <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
        Accounts
      </h2>
      <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        <LineGraph
          dataProp={newAccountsData}
          titleProp={'Daily Active Accounts'}
          selectedTimeRange={newAccountsFilter}
          defaultSelectedValue={newAccountsData.at(-1)?.count}
          timeRangeOptions={Object.values(filterOption) as []}
          onTimeRangeChange={(days) => {
            setnewAccountsFilter(getFilterOptionByValue(days));
          }}
        />
        <LineGraph
          dataProp={dailyAccountsData}
          valueUnit={'ETH'}
          titleProp={'New Accounts'}
          timeRangeOptions={Object.values(filterOption) as []}
          selectedTimeRange={dailyAccountsDataFilter}
          defaultSelectedValue={dailyAccountsData[0]?.count}
          onTimeRangeChange={(days) => {
            setDailyAccountsDataFilter(getFilterOptionByValue(days));
          }}
        />
      </Grid>
    </div>
  );
};

export default TransaccountStats;
