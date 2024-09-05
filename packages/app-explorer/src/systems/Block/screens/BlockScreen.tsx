import { VStack } from '@fuels/ui';
import { useEffect, useState } from 'react';

import { getBlocks } from '../actions/get-blocks';
import BlocksTable from '../components/BlocksTable/BlocksTable';
import { Hero } from '../components/Hero/Hero';

export const BlocksScreen = () => {
  const [_data, setData] = useState(null);

  const fetchBlockData = async () => {
    try {
      console.log('Starting to fetch');
      const result = await getBlocks({ cursor: null });
      console.log('Here are the results===>', result);
      const blockData = result.block;
      setData(blockData);
      console.log(blockData);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  useEffect(() => {
    fetchBlockData();
  }, []);

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
