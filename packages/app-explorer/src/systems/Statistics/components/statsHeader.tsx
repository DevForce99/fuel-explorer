import { Heading, VStack } from '@fuels/ui';
import React, { useState, useEffect } from 'react';
import { tv } from 'tailwind-variants';
import { getBlockStats } from '../actions/getBlocks';
import { getTransactionStats } from '../actions/getTransactions';
import Hero from './Hero/Hero';

const StatsHeader = () => {
  const classes = styles();

  const [stats, setStats] = useState<any[]>([]);

  const getStats = async () => {
    let totalTransactions = 0;
    let totalNetworkFee = 0;
    let totalBlock = 0;
    let tps = 0;
    const transactions: any = await getTransactionStats({ timeFilter: null });
    const blocks: any = await getBlockStats({ timeFilter: null });
    console.log('Stats transactions', transactions);
    if (transactions) {
      transactions.map((transaction: any) => {
        totalTransactions += transaction.count;
        totalNetworkFee += transaction.totalFee;
      });
      tps = totalTransactions / 86400;
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
        timeProp: 'Last 24h',
      },
      {
        titleProp: 'Transaction Per Second (TPS)',
        valuesProp: tps.toFixed(0),
        timeProp: 'Last 24h',
      },
      {
        titleProp: 'Total Network Fees (ETH)',
        valuesProp: totalNetworkFee,
        timeProp: 'Last 24h',
      },
      { titleProp: 'Blocks', valuesProp: totalBlock, timeProp: 'Last 24h' },
    ];
  };

  useEffect(() => {
    getStats().then((value: any) => {
      setStats(value);
    });
  }, []);

  return (
    <VStack>
      <Heading className={classes.title()}>Statistics</Heading>
      <div className="pb-6">
        <Hero stats={stats} />
      </div>
    </VStack>
  );
};

export default StatsHeader;

const styles = tv({
  slots: {
    root: 'overflow-clip relative w-full border-border bg-white dark:bg-gray-1',
    container: [
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
