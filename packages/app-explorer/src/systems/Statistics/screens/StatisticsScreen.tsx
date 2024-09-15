import { Box, Container, Theme } from '@fuels/ui';
import { tv } from 'tailwind-variants';

import AccountStats from '../components/accountStats';
import BlockStats from '../components/blockStats';
import StatsHeader from '../components/statsHeader';
import TransactionStats from '../components/transactionStats';

export const StatisticsScreen = () => {
  const classes = styles();

  return (
    <Theme appearance="light">
      <Box className={classes.root()}>
        <Container className={classes.container()}>
          <StatsHeader />
          <BlockStats />
          <TransactionStats />

          <AccountStats />

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
