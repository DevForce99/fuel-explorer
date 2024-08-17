'use server';

import { z } from 'zod';
import { act } from '~/systems/Core/utils/act-server';
import { sdk } from '~/systems/Core/utils/sdk';

const PER_PAGE = 20;

const schema = z.object({
  before: z.string().nullable(),
});

export const getBlocks = act(schema, async (input) => {
  const before = input.before;

  const { data } = await sdk.getBlocks({ last: PER_PAGE, before: before });
  return data;
});