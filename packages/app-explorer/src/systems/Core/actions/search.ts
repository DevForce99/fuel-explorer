'use server';

import { z } from 'zod';
import { act } from '~/systems/Core/utils/act-server';
import { sdk } from '~/systems/Core/utils/sdk';

const schema = z.object({
  query: z.string(),
});

export const search = act(schema, async ({ query }) => {
  const { data } = await sdk.searchQuery({ search: query }).catch((_) => {
    return { data: { search: null } };
  });
  console.log('------------', data.search);
  return data?.search ?? null;
});
