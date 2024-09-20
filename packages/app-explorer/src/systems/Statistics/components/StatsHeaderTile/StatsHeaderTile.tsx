import { RoundedContainer } from '@fuels/ui';

interface LineGraphProps {
  titleProp: string;
  valuesProp: string;
  timeProp: string;
}

export const StatsHeaderTile: React.FC<LineGraphProps> = ({
  titleProp,
  valuesProp,
  timeProp,
}) => {
  return (
    <RoundedContainer className="w-[17rem] font-semibold">
      <p className="text-heading" style={{ fontSize: '0.75rem' }}>
        {titleProp}
      </p>
      <h1
        className="text-heading -mb-3 -mt-1 font-mono "
        style={{ fontSize: '1.5rem' }}
      >
        {valuesProp}
      </h1>
      <p
        className="text-heading "
        style={{ fontSize: '0.8rem', color: 'var(--gray-8)' }}
      >
        {timeProp}
      </p>
    </RoundedContainer>
  );
};
