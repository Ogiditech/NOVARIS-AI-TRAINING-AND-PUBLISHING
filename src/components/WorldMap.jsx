import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { countryCoords } from '../data/geo';
import { useApp } from '../context/AppContext';

// Very rough continent outlines [lon, lat] — just enough for a stylised dot map.
const land = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 63], [-60, 55], [-55, 47], [-70, 43], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 18], [-88, 15], [-80, 8], [-83, 9], [-92, 15], [-105, 20], [-112, 30], [-117, 32], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 77]],
  [[-80, 9], [-75, 11], [-62, 10], [-50, 0], [-35, -6], [-39, -14], [-48, -26], [-58, -38], [-65, -42], [-68, -55], [-74, -50], [-72, -35], [-71, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [-1, 50], [5, 54], [8, 57], [5, 62], [15, 69], [28, 71], [40, 67], [60, 68], [60, 45], [40, 42], [28, 41], [26, 38], [22, 36], [15, 38], [12, 44], [3, 42], [-5, 36]],
  [[-6, 50], [2, 51], [-2, 56], [-5, 58.5], [-7, 56]],
  [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [20, -35], [17, -30], [12, -17], [13, -5], [9, 4], [-8, 4], [-17, 13]],
  [[44, -25], [48, -25], [50, -15], [47, -12]],
  [[26, 38], [36, 36], [34, 30], [43, 13], [52, 16], [58, 22], [56, 26], [62, 25], [67, 24], [72, 20], [77, 8], [80, 15], [87, 22], [92, 22], [98, 16], [100, 6], [104, 1], [105, 10], [109, 12], [106, 20], [110, 21], [117, 24], [122, 31], [121, 39], [126, 38], [129, 35], [130, 43], [141, 48], [140, 55], [160, 60], [180, 66], [180, 72], [140, 74], [100, 78], [70, 73], [60, 68], [60, 45], [40, 42], [30, 42]],
  [[130, 31], [141, 35], [142, 45], [139, 41], [132, 34]],
  [[95, 5], [106, -6], [115, -8.5], [125, -9], [140, -3], [131, -1], [119, 2], [117, 7], [109, 2], [100, -1]],
  [[120, 6], [126, 7], [124, 14], [120, 18.5]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -10], [146, -19], [153, -26], [150, -37], [141, -38], [135, -34], [129, -31], [115, -34]],
  [[172, -34], [178, -38], [174, -41], [167, -46], [170, -46]],
];

const W = 1000;
const LAT_TOP = 80;
const LAT_BOTTOM = -58;
const H = ((LAT_TOP - LAT_BOTTOM) / 360) * W;
const project = (lon, lat) => [((lon + 180) / 360) * W, ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H];

function inside([x, y], poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const HUB = [32.58, 0.35]; // arcs fan out from East Africa

function arc(from, to) {
  const [x1, y1] = project(...from);
  const [x2, y2] = project(...to);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.28;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

// points: [{ country, learners }] from /api/stats — one glowing dot per country with learners.
function WorldMap({ points = [] }) {
  const { t } = useApp();
  const dots = useMemo(() => {
    const out = [];
    const step = 2.6;
    for (let lat = LAT_TOP; lat >= LAT_BOTTOM; lat -= step) {
      for (let lon = -180; lon <= 180; lon += step) {
        if (land.some((p) => inside([lon, lat], p))) out.push(project(lon, lat));
      }
    }
    return out;
  }, []);

  const cities = useMemo(() => points.filter((p) => countryCoords[p.country]).map((p) => [p.country, ...countryCoords[p.country], p.learners]), [points]);
  const arcs = [...cities].sort((a, b) => b[3] - a[3]).filter((c) => c[0] !== 'Uganda').slice(0, 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={t('common.mapAria')}>
      <defs>
        <radialGradient id="city-glow">
          <stop offset="0" stopColor="#f5c76b" stopOpacity="1" />
          <stop offset="1" stopColor="#f5c76b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arc-g" x1="0" x2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <g className="text-violet-400/30">
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.1} fill="currentColor" />)}
      </g>
      {arcs.map((c, i) => (
        <motion.path
          key={c[0]} d={arc(HUB, [c[1], c[2]])} fill="none" stroke="url(#arc-g)" strokeWidth={1.4} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
          transition={{ duration: 3.2, delay: i * 0.55, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
        />
      ))}
      {cities.map(([name, lon, lat, n], i) => {
        const [x, y] = project(lon, lat);
        const r = 3 + Math.min(6, Math.sqrt(n) * 1.6);
        return (
          <g key={name}>
            <circle cx={x} cy={y} r={r * 3.2} fill="url(#city-glow)" opacity=".35" />
            <circle cx={x} cy={y} r={r} fill="#f5c76b" fillOpacity="0" stroke="#f5c76b" strokeWidth="1.2">
              <animate attributeName="r" from={r} to={r * 4} dur="2.6s" begin={`${(i % 8) * 0.33}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" from="0.9" to="0" dur="2.6s" begin={`${(i % 8) * 0.33}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={r} fill="#f5c76b"><title>{t('hero.mapDot', { country: name, n: n.toLocaleString() })}</title></circle>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(WorldMap);
