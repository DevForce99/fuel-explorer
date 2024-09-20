'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { RoundedContainer } from '../Box/RoundedContainer';
import { ChartConfig } from '../Charts/Charts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../Select';

export interface DataPoint {
  day: string;
  value: number;
}

interface LineGraphProps {
  dataProp: any;
  titleProp: string;
  selectedTimeRange: string;
  defaultSelectedValue?: string | null;
  timeRangeOptions: [];
  onTimeRangeChange: (p: string) => void;
  valueUnit?: string | null;
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#00F58C',
  },
} satisfies ChartConfig;

export const LineGraph: React.FC<LineGraphProps> = ({
  dataProp,
  titleProp,
  selectedTimeRange,
  timeRangeOptions,
  onTimeRangeChange,
  valueUnit,
  defaultSelectedValue,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(defaultSelectedValue);
  const [_hoveredPoint, _setHoveredPoint] = useState<any>(null); // Hover state
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const data = dataProp;

  useEffect(() => {
    if (dataProp.length > 0) {
      setSelectedPoint(defaultSelectedValue);
    }
  }, [selectedTimeRange, dataProp, defaultSelectedValue]);

  const _handleClick = (data: any) => {
    setSelectedPoint(data.count);
  };

  // const handleMouseMove = (e: any) => {
  //   if (e?.activePayload && e.activePayload.length >= 0) {
  //     console.log('This is my hover point', e.activePayload);
  //     setHoveredPoint(e.activePayload[0].payload);
  //   }
  // };

  const chartHeight = containerWidth * 0.5;

  const gradientStartColor = isDarkMode ? '#14b773' : '#14b773';
  const gradientEndColor = isDarkMode ? '#14b773' : '#14b773';

  return (
    <RoundedContainer ref={containerRef} className="py-4 pr-2 pl-5 pb-7">
      <div className="mt-1 flex items-center" style={{ fontSize: '0.8rem' }}>
        <div className="text-heading">{titleProp} &nbsp;</div>
        <Select
          onValueChange={(value) => onTimeRangeChange(value)}
          value={selectedTimeRange}
        >
          <SelectTrigger
            className="px-4 py-0 rounded"
            style={{ fontSize: '0.8rem' }}
          >
            <div className="text-heading">{selectedTimeRange}</div>
          </SelectTrigger>
          <SelectContent className="bg-gray-2">
            <SelectGroup>
              {timeRangeOptions.map((filter) => (
                <SelectItem
                  key={filter}
                  value={filter}
                  onClick={() => onTimeRangeChange(filter)}
                >
                  {filter}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow my-3 mt-2 ">
        <h1 className="text-heading text-xl">
          {selectedPoint || defaultSelectedValue} {valueUnit}
        </h1>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart
          data={data}
          // onClick={(e) => {
          //   if (e?.activePayload && e.activePayload.length >= 0) {
          //     handleClick(e.activePayload[0].payload);
          //   }
          // }}
          // onMouseMove={handleMouseMove} // Add hover support
        >
          <CartesianGrid stroke="rgba(255, 255, 255, 0.04)" />

          <XAxis
            dataKey="start"
            tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              className: 'fill-heading',
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              className: 'fill-heading',
            }}
          />

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0.2" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={gradientStartColor}
                stopOpacity={1}
              />
              <stop
                offset="30%"
                stopColor={gradientStartColor}
                stopOpacity={0.7}
              />
              <stop
                offset="100%"
                stopColor={gradientEndColor}
                stopOpacity={0.0}
              />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="count"
            stroke={chartConfig.desktop.color}
            strokeWidth={1.5}
            fill="url(#colorGradient)"
            dot={{ fill: '#14b773', stroke: '#000', strokeWidth: 2, r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Tooltip
            formatter={(value) => [value]} // Simply return the value (count) without a label
            labelFormatter={(label) => new Date(label).toLocaleString()}
            contentStyle={{
              backgroundColor: 'var(--gray-1)', // Set the background to your custom gray color
              borderColor: 'var(--gray-2)', // Set the border color
              borderRadius: '8px', // Customize the border radius
              color: 'var(--gray-1)', // Text color
            }}
            labelStyle={{
              color: 'var(--gray-12)', // Label text color
              fontWeight: 'bold',
            }}
            itemStyle={{
              color: '#00F58C', // Data value text color
            }}
            cursor={{ stroke: '#00F58C', strokeWidth: 2 }} // Customize hover line style
          />
        </AreaChart>
      </ResponsiveContainer>
    </RoundedContainer>
  );
};
