'use server';

import { z } from 'zod';
import { act } from '~/systems/Core/utils/act-server';
import { sdk } from '~/systems/Core/utils/sdk';
import { getDailyAccountCreationStats } from '~/systems/Statistics/actions/getAccounts';

const PER_PAGE = 10;

const schema = z.object({
  cursor: z.string().optional().nullable(),
  dir: z.enum(['after', 'before']).optional(),
});

export const getLastTxs = act(schema, async ({ cursor, dir = 'after' }) => {
  const params = { last: PER_PAGE } as {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
  };
  if (cursor && dir === 'after') {
    params.after = cursor;
  }
  if (cursor && dir === 'before') {
    params.before = cursor;
  }
  const { data } = await sdk.recentTransactions(params);
  await getDailyAccountCreationStats({ timeFilter: '30days' });
  return data.transactions;
});
