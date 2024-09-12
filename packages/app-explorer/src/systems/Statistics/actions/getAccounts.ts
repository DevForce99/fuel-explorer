'use server';

import { z } from 'zod';
import { act } from '~/systems/Core/utils/act-server';
import { sdk } from '~/systems/Core/utils/sdk';
import { DateHelper } from '../utils/date';
import {
  createIntervals,
  getUnitAndInterval,
  processAccounts, // You would need to implement this to handle account-specific data
} from '../utils/utils';

const schema = z.object({
  timeFilter: z.string().optional().nullable(),
});

interface AccountParams {
  timeFilter?: string;
}

interface AccountNode {
  __typename: 'Account';
  timestamp: string;
}

// Common function to process account statistics
async function fetchAccountStatistics(
  params: AccountParams,
  fieldName:
    | 'accountCreationStatistics'
    | 'cumulativeAccountCreationStatistics',
  unit: 'minute' | 'hour' | 'day' | 'month',
  intervalSize: number,
  isCumulative = false,
) {
  const data = await (isCumulative
    ? sdk.cumulativeAccountCreationStatistics(params)
    : sdk.accountCreationStatistics(params));

  const { nodes, offset } = extractAccountData(data, fieldName);

  if (!nodes.length) {
    return isCumulative ? { accounts: [], offset: 0 } : { accounts: [] };
  }

  const firstTimestamp = Number(DateHelper.tai64toDate(nodes[0].timestamp));
  const lastTimestamp = Number(
    DateHelper.tai64toDate(nodes[nodes.length - 1].timestamp),
  );

  const intervalMap = createIntervals(
    firstTimestamp,
    lastTimestamp,
    unit,
    intervalSize,
  );
  const accounts = processAccounts(nodes, intervalMap); // Use this function for account-specific logic

  if (isCumulative) {
    return { accounts, offset };
  }

  return accounts;
}

// Helper to extract nodes and timestamps from the response
function extractAccountData(
  data: any,
  fieldName: string,
): { nodes: AccountNode[]; offset?: number } {
  const nodes = data.data[fieldName]?.nodes || [];
  const offset = data.data[fieldName]?.accountOffset;
  return { nodes, offset };
}

async function getCumulativeAccountCreationStats(
  params: AccountParams,
  unit: 'minute' | 'hour' | 'day' | 'month',
  intervalSize: number,
) {
  return fetchAccountStatistics(
    params,
    'cumulativeAccountCreationStatistics',
    unit,
    intervalSize,
    true,
  );
}

export async function getAccountCreationStats(
  params: AccountParams,
  unit: 'minute' | 'hour' | 'day' | 'month',
  intervalSize: number,
) {
  return fetchAccountStatistics(
    params,
    'accountCreationStatistics',
    unit,
    intervalSize,
  );
}

export const getAccountStats = act(schema, async ({ timeFilter }) => {
  const params = { timeFilter: timeFilter } as { timeFilter?: string };
  const { unit, intervalSize } = getUnitAndInterval(params.timeFilter || '');

  return getAccountCreationStats(params, unit, intervalSize);
});

export const getDailyAccountCreationStats = act(
  schema,
  async ({ timeFilter }) => {
    const params = { timeFilter: timeFilter } as { timeFilter?: string };

    // Use 'day' as the unit and 1 as the interval size
    return getAccountCreationStats(params, 'day', 1);
  },
);

export const getCumulativeAccountStats = act(schema, async ({ timeFilter }) => {
  const params = { timeFilter: timeFilter } as { timeFilter?: string };
  const { unit, intervalSize } = getUnitAndInterval(params.timeFilter || '');

  return getCumulativeAccountCreationStats(params, unit, intervalSize);
});
