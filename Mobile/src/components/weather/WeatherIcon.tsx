import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  G,
  SvgProps,
} from 'react-native-svg';

// ── Reusable primitives ──

const SunRays = ({ stroke = '#ffa500' }: { stroke?: string }) => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <>
      {angles.map(a => (
        <Line
          key={a}
          x1={0}
          y1={9}
          x2={0}
          y2={12}
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          rotation={a}
          origin="0,0"
        />
      ))}
      <Circle r={5} fill={stroke} stroke={stroke} strokeWidth={2} />
    </>
  );
};

const CLOUD_D =
  'M47.7,35.4c0-4.6-3.7-8.2-8.2-8.2c-1,0-1.9,0.2-2.8,0.5c-0.3-3.4-3.1-6.2-6.6-6.2c-3.7,0-6.7,3-6.7,6.7c0,0.8,0.2,1.6,0.4,2.3c-0.3-0.1-0.7-0.1-1-0.1c-3.7,0-6.7,3-6.7,6.7c0,3.6,2.9,6.6,6.5,6.7l17.2,0C44.2,43.3,47.7,39.8,47.7,35.4z';

const Cloud = ({
  fill = '#57A0EE',
  tx = -20,
  ty = -11,
  scaleVal,
}: {
  fill?: string;
  tx?: number;
  ty?: number;
  scaleVal?: number;
}) => (
  <G translate={`${tx}, ${ty}`} scale={scaleVal}>
    <Path
      d={CLOUD_D}
      fill={fill}
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={1.2}
    />
  </G>
);

const RainLines = ({
  count = 3,
  stroke = '#91C0F8',
}: {
  count?: number;
  stroke?: string;
}) => {
  const offsets = count === 2 ? [-3, 3] : [-4, 0, 4];
  return (
    <G translate="10,35" rotation={10} origin="0,0">
      {offsets.map((ox, i) => (
        <Line
          key={i}
          x1={ox}
          y1={0}
          x2={ox}
          y2={8}
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="4,4"
        />
      ))}
    </G>
  );
};

const SnowFlake = ({ cx, cy }: { cx: number; cy: number }) => {
  const angles = [0, 45, 90, 135];
  return (
    <G translate={`${cx},${cy}`}>
      {angles.map(a => (
        <Line
          key={a}
          x1={0}
          y1={-2.5}
          x2={0}
          y2={2.5}
          stroke="#57A0EE"
          strokeWidth={a === 0 ? 1.2 : 1}
          strokeLinecap="round"
          rotation={a}
          origin="0,0"
        />
      ))}
    </G>
  );
};

const Lightning = ({ tx = 4, ty = 28 }: { tx?: number; ty?: number }) => (
  <G translate={`${tx},${ty}`} scale={1.2}>
    <Polygon
      points="11.1,6.9 14.3,-2.9 20.5,-2.9 16.4,4.3 20.3,4.3 11.5,14.6 14.9,6.9"
      fill="#ffa500"
      stroke="#fff"
      strokeWidth={0.8}
    />
  </G>
);

// ── 10 weather icons ──

const ClearDay = (props: SvgProps) => (
  <Svg viewBox="0 0 50 50" {...props}>
    <G translate="25,25">
      <SunRays />
    </G>
  </Svg>
);

const CloudyDay1 = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <G translate="0,16">
        <SunRays />
      </G>
      <Cloud fill="#C6DEFF" tx={-20} ty={-11} />
    </G>
  </Svg>
);

const CloudyDay2 = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <G translate="0,16">
        <SunRays />
      </G>
      <Cloud fill="#91C0F8" tx={-20} ty={-11} />
    </G>
  </Svg>
);

const CloudyOriginal = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <Cloud fill="#91C0F8" tx={-10} ty={-8} scaleVal={0.6} />
      <Cloud fill="#57A0EE" tx={-20} ty={-11} />
    </G>
  </Svg>
);

const Fog = (props: SvgProps) => (
  <Svg viewBox="0 0 56 48" {...props}>
    <G translate="6,18">
      {[
        { y: 0, x1: 1, x2: 37, da: '3,5,17,5,7' },
        { y: 5, x1: 9, x2: 33, da: '11,7,15' },
        { y: 10, x1: 5, x2: 40, da: '11,7,3,5,9' },
        { y: 15, x1: 7, x2: 42, da: '13,5,9,5,3' },
      ].map((l, i) => (
        <Line
          key={i}
          x1={l.x1}
          y1={l.y}
          x2={l.x2}
          y2={l.y}
          stroke="#c6deff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={l.da}
        />
      ))}
    </G>
  </Svg>
);

const Rainy5 = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <Cloud />
      <RainLines count={2} />
    </G>
  </Svg>
);

const Rainy6 = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <Cloud />
      <RainLines count={3} />
    </G>
  </Svg>
);

const Snowy6 = (props: SvgProps) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <G translate="20,10">
      <Cloud />
      <SnowFlake cx={3} cy={37} />
      <SnowFlake cx={11} cy={37} />
      <SnowFlake cx={20} cy={37} />
    </G>
  </Svg>
);

const Sonagi = (props: SvgProps) => (
  <Svg viewBox="0 0 56 56" {...props}>
    <G translate="16,2">
      <Cloud fill="#91C0F8" tx={-10} ty={-6} scaleVal={0.6} />
      <Cloud fill="#57A0EE" tx={-20} ty={-11} />
      <RainLines count={3} />
      <Lightning tx={-1} ty={28} />
    </G>
  </Svg>
);

const Thunderstorms = (props: SvgProps) => (
  <Svg viewBox="0 0 56 48" {...props}>
    <G translate="16,-2">
      <Cloud fill="#91C0F8" tx={-10} ty={-6} scaleVal={0.6} />
      <Cloud fill="#57A0EE" tx={-20} ty={-11} />
      <Lightning tx={-4} ty={28} />
    </G>
  </Svg>
);

// ── Description → Component mapping ──
const WEATHER_MAP: Record<string, React.FC<SvgProps>> = {
  맑음: ClearDay,
  '대체로 맑음': CloudyDay1,
  '구름 조금': CloudyDay2,
  흐림: CloudyOriginal,
  안개: Fog,
  이슬비: Rainy5,
  비: Rainy6,
  눈: Snowy6,
  소나기: Sonagi,
  뇌우: Thunderstorms,
};

const KEYWORD_MAP: [string, React.FC<SvgProps>][] = [
  ['맑', ClearDay],
  ['흐', CloudyOriginal],
  ['구름', CloudyDay2],
  ['안개', Fog],
  ['이슬비', Rainy5],
  ['소나기', Sonagi],
  ['뇌우', Thunderstorms],
  ['번개', Thunderstorms],
  ['눈', Snowy6],
  ['비', Rainy6],
];

function getIcon(description: string): React.FC<SvgProps> {
  const exact = WEATHER_MAP[description];
  if (exact) return exact;
  for (const [kw, comp] of KEYWORD_MAP) {
    if (description.includes(kw)) return comp;
  }
  return CloudyOriginal;
}

// ── Public component ──

interface WeatherIconProps {
  description: string;
  size?: number;
}

export default function WeatherIcon({
  description,
  size = 28,
}: WeatherIconProps) {
  const Icon = getIcon(description);
  return <Icon width={size} height={size} />;
}
