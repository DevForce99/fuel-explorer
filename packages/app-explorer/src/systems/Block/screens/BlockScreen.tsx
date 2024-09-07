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
  const [dir, setDir] = useState<'after' | 'before'>('after');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const calculateTotalPages = () => {
    if (data?.pageInfo.endCursor) {
      const endCursor = Number(data.pageInfo.endCursor);
      return Math.ceil(endCursor / limit);
    }
    return 1;
  };

  useEffect(() => {
    if (data) {
      const totalPageCount = calculateTotalPages();
      setTotalPages(totalPageCount);
    }
  }, [data]);

  const fetchBlockData = async (
    cursor: string | null = null,
    dir: 'after' | 'before' = 'after',
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data with cursor:', cursor, 'and direction:', dir);
      const result = await getBlocks({ cursor, dir });
      const blockData = result.blocks;
      setData(blockData);
    } catch (err) {
      console.error('Error fetching block data:', err);
      setError('Failed to fetch block data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChanged = (newPageNumber: number) => {
    if (data) {
      const newDir = newPageNumber > currentPage ? 'before' : 'after';
      setDir(newDir);

      let newCursor: string | null = null;
      if (newDir === 'after' && data.pageInfo.startCursor) {
        newCursor = data.pageInfo.startCursor;
      } else if (newDir === 'before' && data.pageInfo.endCursor) {
        newCursor = data.pageInfo.endCursor;
      }
      setCurrentPage(newPageNumber);
      setCurrentCursor(newCursor);
    }
  };

  useEffect(() => {
    fetchBlockData(currentCursor, dir);
  }, [currentCursor, dir]);

  useEffect(() => {
    console.log(currentPage);
  }, [currentPage]);

  return (
    <VStack>
      <Hero />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading blocks...</p>
      ) : (
        data && (
          <BlocksTable
            blocks={data}
            onPageChanged={handlePageChanged}
            pageCount={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )
      )}
    </VStack>
  );
};
