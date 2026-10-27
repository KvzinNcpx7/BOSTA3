import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { money } from "../game/engine";
export function Chart({
  values,
  color = "#c2f66b",
  large = false,
}: {
  values: number[];
  color?: string;
  large?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={large ? 230 : 38}>
      <AreaChart
        data={values.map((v, i) => ({ i, v }))}
        margin={{
          top: 10,
          right: large ? 10 : 0,
          bottom: 0,
          left: large ? 8 : 0,
        }}
      >
        <defs>
          <linearGradient
            id={large ? "largeFill" : `fill${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity={large ? 0.22 : 0.1}
            />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {large && (
          <>
            <CartesianGrid
              vertical={false}
              stroke="#272a2d"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="i"
              tickFormatter={(i) => (i === 0 ? "Início" : `${i} ticks`)}
              axisLine={false}
              tickLine={false}
              minTickGap={75}
              tick={{ fill: "#71767e", fontSize: 11 }}
            />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              formatter={(v) => [money(Number(v)), "Valor"]}
              labelFormatter={(v) => `Momento ${v}`}
              contentStyle={{
                background: "#191c20",
                border: "1px solid #353a40",
                borderRadius: 8,
                color: "#fff",
              }}
            />
          </>
        )}
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={large ? 2.5 : 1.5}
          fill={`url(#${large ? "largeFill" : `fill${color.replace("#", "")}`})`}
          isAnimationActive={large}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
