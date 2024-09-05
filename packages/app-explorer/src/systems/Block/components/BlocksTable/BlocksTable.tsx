import { GridTable } from '@fuels/ui';
import React, { useEffect, useState } from 'react';
import { getBlock } from '../../actions/get-block';
import BlockEfficiencyItem from '../BlockEfficiencyItem/BlockEfficiencyItem';
import BlockHashItem from '../BlockHashItem/BlockHashItem';
import BlockItem from '../BlockItem/BlockItem';
import BlockTimeItem from '../BlockTimeItem/BlockTimeItem';
import BlockValidatorItem from '../BlockValidatorItem/BlockValidatorItem';
export interface RowData {
  id: number;
  name: string;
  age: number;
  email: string;
  status: string;
}

const columns = [
  {
    name: 'Block',
    cell: (row: any) => (
      <BlockItem blockId={row.id} ethValue={'1.987986798698 ETH'} />
    ),
    sortable: true,
  },
  {
    name: 'BlockHash',
    cell: (row: any) => (
      <BlockHashItem hashAddress={row.hashAddress} width="100px" />
    ),
    sortable: true,
  },
  {
    name: 'Transactions',
    cell: (row: any) => (
      <div className="font-mono text-sm text-gray-9">{row.transactions}</div>
    ),
    sortable: true,
  },
  {
    name: 'Rewards',
    cell: () => <div className="font-mono text-sm text-gray-9">12</div>,
    sortable: false,
  },
  {
    name: 'Validator',
    cell: (row: any) => (
      <div className="flex items-center justify-center w-full">
        <BlockValidatorItem hashAddress={row.producer} />
      </div>
    ),
    sortable: true,
  },
  {
    name: 'Efficiency',
    cell: () => <BlockEfficiencyItem current={10} progress={44} total={100} />,
    sortable: true,
  },
  {
    name: 'Time',
    cell: (row: any) => <BlockTimeItem time={new Date(row.time)} />,
    sortable: true,
  },
  {
    name: '',
    cell: (row: any) => (
      <button
        type="button"
        onClick={() => console.log('Button clicked for:', row.name)}
        className="px-4 py-[0.4rem] bg-gray-3 hover:text-black hover:bg-brand text-black dark:text-white rounded font-semibold font-mono"
      >
        View
      </button>
    ),
    sortable: false,
  },
];

function BlocksTable() {
  const [data, setData] = useState<any>([]);

  const fetchBlockData = async () => {
    try {
      const result = await getBlock({ id: null });
      const blockData = result.block;
      setData(blockData);
      console.log(blockData);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  useEffect(() => {
    fetchBlockData();

    // Optionally set up polling for real-time updates
    const interval = setInterval(fetchBlockData, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  return (
    <div>
      <GridTable
        columns={columns}
        data={data}
        onPageChanged={() => {}}
        pageCount={1}
      />
    </div>
  );
}

export default BlocksTable;
