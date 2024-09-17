import { Box, Theme } from '@fuels/ui';

import AccountStats from '../components/accountStats';
import BlockStats from '../components/blockStats';
import StatsHeader from '../components/statsHeader';
import TransactionStats from '../components/transactionStats';

export const StatisticsScreen = () => {
  return (
    <Theme>
      <Box>
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
      </Box>
    </Theme>
  );
};
