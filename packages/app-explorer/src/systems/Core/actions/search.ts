'use server';

import { z } from 'zod';
import { act } from '~/systems/Core/utils/act-server';
import { isValidAddress } from '~/systems/Core/utils/address';
import { sdk } from '~/systems/Core/utils/sdk';

const schema = z.object({
  query: z.string(),
});

export const search = act(schema, async ({ query }) => {
  const isAddressValid = isValidAddress(query);
  if (!isAddressValid) {
    const isValidBlockHeight = !Number.isNaN(Number(query));
    if (isValidBlockHeight) {
      const { data } = await sdk
        .searchQueryByBlock({ search: query })
        .catch((_) => {
          return { data: { search: null } };
        });
      if (data && 'searchByBlock' in data) {
        return data.searchByBlock ?? null;
      }
      return null;
    }
    return null;
  }
  const { data } = await sdk.searchQuery({ search: query }).catch((_) => {
    return { data: { search: null } };
  });
  return data?.search ?? null;
});
