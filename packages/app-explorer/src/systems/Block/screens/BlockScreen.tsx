import { VStack } from '@fuels/ui';
import { useEffect, useState } from 'react';

import { getBlocks } from '../actions/get-blocks';
import BlocksTable from '../components/BlocksTable/BlocksTable';
import { Hero } from '../components/Hero/Hero';

export const BlocksScreen = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch blocks data
  async function fetchBlocksData(
    cursor?: string,
    dir: 'after' | 'before' = 'after',
  ) {
    setLoading(true);
    try {
      const data = await getBlocks({ cursor, dir });
      console.log('uieurbveiurbrfieurbieube');
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch blocks data on component mount
  useEffect(() => {
    fetchBlocksData();
  }, []);

  useEffect(() => {
    console.log(blocks);
  }, [blocks]);

  return (
    <VStack>
      <Hero />
      <div>{loading ? <p>Loading...</p> : <BlocksTable />}</div>
    </VStack>
  );
};
