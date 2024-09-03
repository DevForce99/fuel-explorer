import { VStack } from '@fuels/ui';

import BlocksTable from '../components/BlocksTable/BlocksTable';
import { Hero } from '../components/Hero/Hero';

export const BlocksScreen = () => {
  return (
    <VStack>
      <Hero />
      {/* <BlockTimeItem time={DateTime.now()} /> */}
      <div>
        <BlocksTable />
      </div>
    </VStack>
  );
};
