import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface StatisticsChartsProps {
  statusDistribution: Record<string, number>;
  providerStatistics: Array<{
    providerId: number;
    providerName: string;
    totalLinks: number;
    activeLinks: number;
    deadLinks: number;
    availabilityPercentage: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     '#10b981',
  DEAD:       '#ef4444',
  CHANGED:    '#f59e0b',
  RESTRICTED: '#f97316',
  ERROR:      '#dc2626',
  UNKNOWN:    '#6b7280',
};

const CHART_BG   = '#16161f';
const GRID_COLOR = '#1e1e2e';
const AXIS_COLOR = '#475569';
const TT_BG      = '#1e1e2e';
const TT_BORDER  = '#2a2a3a';
const TT_TEXT    = '#e2e8f0';

const customTooltipStyle = {
  backgroundColor: TT_BG,
  border: `1px solid ${TT_BORDER}`,
  borderRadius: '12px',
  color: TT_TEXT,
  fontSize: '13px',
  padding: '8px 12px',
};

function ChartCard({ title, children, fullWidth = false }: { title: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}
      style={{ background: CHART_BG, border: `1px solid ${TT_BORDER}` }}
    >
      <h3 className="font-semibold mb-5" style={{ color: '#f1f5f9' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function StatisticsCharts({ statusDistribution, providerStatistics }: StatisticsChartsProps) {
  const statusData = Object.entries(statusDistribution)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] ?? STATUS_COLORS.UNKNOWN,
    }));

  const providerData = providerStatistics.map(p => ({
    name: p.providerName,
    total: p.totalLinks,
    active: p.activeLinks,
    dead: p.deadLinks,
    availability: p.availabilityPercentage,
  }));

  const isEmpty = statusData.length === 0 && providerData.length === 0;

  if (isEmpty) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-16 gap-3"
        style={{ background: CHART_BG, border: `1px solid ${TT_BORDER}` }}
      >
        <svg className="w-10 h-10" style={{ color: '#2a2a3a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm" style={{ color: '#475569' }}>Sin datos para mostrar todavía</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Pie chart */}
      <ChartCard title="Distribución de Estados">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="45%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
            >
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} cursor={false} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={value => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Provider bar chart */}
      <ChartCard title="Links por Proveedor">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={providerData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={value => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
            />
            <Bar dataKey="active" name="Activos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="dead" name="Caídos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Availability bar chart */}
      <ChartCard title="Disponibilidad por Proveedor (%)" fullWidth>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={providerData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              formatter={(v: number) => [`${v.toFixed(1)}%`, 'Disponibilidad']}
            />
            <Bar dataKey="availability" name="Disponibilidad" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}
