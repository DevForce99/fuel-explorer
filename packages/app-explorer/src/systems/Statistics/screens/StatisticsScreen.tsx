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
      </Box>
    </Theme>
  );
};
