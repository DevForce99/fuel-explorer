import { StatsHeader } from '../StatsHeader/StatsHeader';

interface StatsData {
  titleProp: string;
  valuesProp: string;
  timeProp: string;
}

const Hero = ({ stats }: { stats: StatsData[] }) => {
  return (
    <div className="w-full flex flex-wrap gap-3">
      {stats.map((stat, index) => (
        <StatsHeader
          key={index}
          titleProp={stat.titleProp}
          valuesProp={stat.valuesProp}
          timeProp={stat.timeProp}
        />
      ))}
    </div>
  );
};

export default Hero;
