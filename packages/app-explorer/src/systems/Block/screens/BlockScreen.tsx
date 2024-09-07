import { VStack } from '@fuels/ui';
import { useEffect, useState } from 'react';

import { GQLBlocksQuery } from '@fuel-explorer/graphql';
import { getBlocks } from '../actions/get-blocks';
import BlocksTable from '../components/BlocksTable/BlocksTable';
import { Hero } from '../components/Hero/Hero';

export const BlocksScreen = () => {
  const [currentGridPage, setCurrentGridPage] = useState<number>();
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
      console.log(blockData);
    } catch (err) {
      console.error('Error fetching block data:', err);
      setError('Failed to fetch block data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChanged = (newPageNumber: number) => {
    if (data) {
      const newDir = newPageNumber > currentPage ? 'after' : 'before';
      setDir(newDir);

      let newCursor: string | null = null;
      if (newDir === 'after' && data.pageInfo.endCursor) {
        newCursor = (+data.pageInfo.endCursor + (limit - 1)).toString();
      } else if (newDir === 'before' && data.pageInfo.startCursor) {
        newCursor = (+data.pageInfo.startCursor - (limit - 1)).toString();
      }

      setCurrentPage(newPageNumber);
      setCurrentCursor(newCursor);
      fetchBlockData(newCursor, newDir);
    }
  };

  useEffect(() => {
    fetchBlockData(currentCursor, dir);
  }, []);

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
            currentPage={currentGridPage}
            setCurrentPage={setCurrentGridPage}
          />
        )
      )}
    </VStack>
  );
};
