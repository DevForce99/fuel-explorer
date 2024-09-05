import { VStack } from '@fuels/ui';
import { useEffect, useState } from 'react';

import { GQLBlocksQuery } from '@fuel-explorer/graphql';
import { getBlocks } from '../actions/get-blocks';
import BlocksTable from '../components/BlocksTable/BlocksTable';
import { Hero } from '../components/Hero/Hero';

export const BlocksScreen = () => {
  const [data, setData] = useState<GQLBlocksQuery['blocks'] | undefined>(
    undefined,
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null); // Current cursor state
  const limit = 10; // Assuming limit per page is 10 blocks

  // Calculate total pages based on endCursor
  const totalPage = () => {
    if (data?.pageInfo.endCursor) {
      const endCursor = Number(data.pageInfo.endCursor);
      return Math.ceil(endCursor / limit); // Calculate total pages
    }
    return 1;
  };

  // Set total pages when data changes
  useEffect(() => {
    if (data) {
      const totalPageCount = totalPage();
      setTotalPages(totalPageCount);
    }
  }, [data]);

  // Fetch blocks with the given cursor
  const fetchBlockData = async (cursor: string | null = null) => {
    try {
      console.log('Starting to fetch data with cursor:', cursor);
      const result = await getBlocks({ cursor });
      const blockData = result.blocks;
      setData(blockData);
      console.log(blockData);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  // Handle page changes
  const handlePageChanged = (pageNumber: number) => {
    const newCursor =
      pageNumber > 0 ? data?.pageInfo.endCursor : data?.pageInfo.startCursor;
    if (newCursor) {
      setCurrentCursor(newCursor);
    }
  };

  // Fetch data when the component mounts and when the cursor changes
  useEffect(() => {
    fetchBlockData(currentCursor);
  }, [currentCursor]);

  return (
    <VStack>
      <Hero />
      {data ? (
        <BlocksTable
          blocks={data}
          onPageChanged={handlePageChanged}
          pageCount={totalPages}
        />
      ) : (
        <p>Loading blocks...</p>
      )}
    </VStack>
  );
};
