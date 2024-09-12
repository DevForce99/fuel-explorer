import { DateHelper } from './date';

interface TransactionNode {
  __typename: 'TransactionFee';
  fee: string;
  timestamp: string;
}

interface Interval {
  start: Date;
  end: Date;
  count: number; // To track the number of transactions
  totalFee: number; // To track the total transaction fees
}

export function getUnitAndInterval(timeRange: string): {
  unit: 'minute' | 'hour' | 'day' | 'month';
  intervalSize: number;
} {
  switch (timeRange) {
    case '1hr':
      return { unit: 'minute', intervalSize: 5 };
    case '12hr':
      return { unit: 'hour', intervalSize: 1 };
    case '1day':
      return { unit: 'hour', intervalSize: 2 };
    case '7days':
      return { unit: 'hour', intervalSize: 12 };
    case '14days':
      return { unit: 'day', intervalSize: 1 };
    case '30days':
      return { unit: 'day', intervalSize: 3 };
    case '90days':
      return { unit: 'day', intervalSize: 10 };
    default:
      return { unit: 'month', intervalSize: 1 };
  }
}

export enum filterOption {
  hr1 = '1H',
  hr12 = '12H',
  d1 = '1D',
  d7 = '7D',
  d14 = '14D',
  d30 = '30D',
  d90 = '90D',
  All = 'All Time',
}
export const getFilterOptionByValue = (value: string): filterOption => {
  console.log('Value is', value);
  switch (value) {
    case '1H':
      return filterOption.hr1;

    case '12H':
      return filterOption.hr12;

    case '1D':
      return filterOption.d1;

    case '7D':
      return filterOption.d7;

    case '14D':
      return filterOption.d14;

    case '30D':
      return filterOption.d30;

    case '90D':
      return filterOption.d90;

    case 'All Time':
      return filterOption.All;

    default:
      return filterOption.d30;
  }
};

export const mapTimeRangeFilterToDataValue = (value: string): string | null => {
  switch (value) {
    case filterOption.hr1:
      return '1hr';
    case filterOption.hr12:
      return '12hr';
    case filterOption.d1:
      return '1day';
    case filterOption.d7:
      return '7days';
    case filterOption.d14:
      return '14days';
    case filterOption.d30:
      return '30days';
    case filterOption.d90:
      return '90days';
    case filterOption.All:
      return null;
    default:
      return '30days';
  }
};

function roundToNearest(
  time: number,
  unit: 'minute' | 'hour' | 'day' | 'month',
  roundUp = false,
): number {
  const date = new Date(time);

  switch (unit) {
    case 'minute': {
      const msInMinute = 60 * 1000;
      const msInFiveMinutes = 5 * msInMinute;
      return roundUp
        ? Math.ceil(time / msInFiveMinutes) * msInFiveMinutes
        : Math.floor(time / msInFiveMinutes) * msInFiveMinutes;
    }

    case 'hour': {
      const msInHour = 60 * 60 * 1000;
      return roundUp
        ? Math.ceil(time / msInHour) * msInHour
        : Math.floor(time / msInHour) * msInHour;
    }

    case 'day':
      if (roundUp) {
        date.setUTCHours(0, 0, 0, 0);
        return date.getTime() + 24 * 60 * 60 * 1000; // Add one day
      }
      date.setUTCHours(0, 0, 0, 0); // Set to midnight
      return date.getTime();

    case 'month':
      if (roundUp) {
        if (date.getUTCMonth() === 11) {
          // If December, increment year
          date.setUTCFullYear(date.getUTCFullYear() + 1);
          date.setUTCMonth(0);
        } else {
          date.setUTCMonth(date.getUTCMonth() + 1);
        }
        date.setUTCDate(1); // First day of the next month
      } else {
        date.setUTCDate(1); // First day of the current month
      }
      date.setUTCHours(0, 0, 0, 0); // Set time to midnight
      return date.getTime();
  }
}

// General interval creation function
export function createIntervals(
  startTime: number,
  endTime: number,
  unit: 'minute' | 'hour' | 'day' | 'month',
  intervalSize: number,
): Array<{ start: Date; end: Date; count: number; totalFee: number }> {
  const roundedStartTime = roundToNearest(startTime, unit);
  const roundedEndTime = roundToNearest(endTime, unit, true);

  const intervals: Array<{
    start: Date;
    end: Date;
    count: number;
    totalFee: number;
  }> = [];

  let currentTime = roundedStartTime;

  if (unit === 'month') {
    // Handle month-specific interval logic (varying days in a month)
    const currentDate = new Date(roundedStartTime);
    while (currentDate.getTime() < roundedEndTime) {
      const startInterval = new Date(currentDate);
      currentDate.setUTCMonth(currentDate.getUTCMonth() + intervalSize); // Move by `intervalSize` months
      const endInterval = new Date(currentDate);
      intervals.push({
        start: startInterval,
        end: endInterval,
        count: 0,
        totalFee: 0,
      });
    }
  } else {
    // Handle minute, hour, and day intervals
    const msInUnit = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
    };

    const intervalDuration = intervalSize * msInUnit[unit];

    while (currentTime < roundedEndTime) {
      const startInterval = new Date(currentTime);
      const endInterval = new Date(currentTime + intervalDuration);
      intervals.push({
        start: startInterval,
        end: endInterval,
        count: 0,
        totalFee: 0,
      });
      currentTime += intervalDuration;
    }
  }

  return intervals;
}

// Helper to process transactions and map to intervals
export function processTransactions(
  nodes: TransactionNode[],
  intervalMap: Interval[],
) {
  nodes.forEach((transaction) => {
    const transactionTimestamp = Number(
      DateHelper.tai64toDate(transaction.timestamp),
    );
    const transactionFee = Number(transaction.fee);

    // Find the correct interval for the current transaction
    for (const interval of intervalMap) {
      const intervalStart = new Date(interval.start).getTime();
      const intervalEnd = new Date(interval.end).getTime();

      if (
        transactionTimestamp >= intervalStart &&
        transactionTimestamp < intervalEnd
      ) {
        // Increment count and add the transaction fee to totalFee
        interval.count += 1;
        interval.totalFee += transactionFee;
        break; // Transaction assigned, no need to check further
      }
    }
  });
  return intervalMap;
}
