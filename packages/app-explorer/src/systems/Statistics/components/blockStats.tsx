import { Grid } from '@fuels/ui';

import { LineGraph } from '@fuels/ui';
import { useEffect, useState } from 'react';
import { getBlockStats } from '../actions/getBlocks';
import {
  filterOption,
  getFilterOptionByValue,
  mapTimeRangeFilterToDataValue,
} from '../utils/utils';

const BlockStats = () => {
  const [newBlocksData, setNewBlocksData] = useState<any[]>([]);
  const [averageBlocksData, setAverageBlocksData] = useState<any[]>([]);

  const [blockTimeFilter, setBlockTimeFilter] = useState<filterOption>(
    filterOption.All,
  );
  const [blockAvgTimeFilter, setblockAvgTimeFilter] = useState<filterOption>(
    filterOption.All,
  );

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

  useEffect(() => {
    getBlockStatistics(blockTimeFilter).then((value: any) => {
      setNewBlocksData(value);
    });
  }, [blockTimeFilter]);

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
    <div className="text-heading text-md font-mono my-20">
      <h2 className="font-mono" style={{ fontSize: '1.5rem' }}>
        Blocks
      </h2>
      <Grid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LineGraph
          dataProp={newBlocksData}
          titleProp={'New Block'}
          defaultSelectedValue={newBlocksData[0]?.count}
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
          defaultSelectedValue={averageBlocksData[0]?.count}
          timeRangeOptions={Object.values(filterOption) as []}
          valueUnit={'ETH'}
          onTimeRangeChange={(days) => {
            setblockAvgTimeFilter(getFilterOptionByValue(days));
          }}
        />
      </Grid>
    </div>
  );
};

export default BlockStats;
