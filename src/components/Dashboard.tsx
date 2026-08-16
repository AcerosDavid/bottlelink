import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import StatisticsCharts from './StatisticsCharts';

interface Statistics {
  totalLinks: number;
  activeLinks: number;
  deadLinks: number;
  changedLinks: number;
  errorLinks: number;
  restrictedLinks: number;
  availabilityPercentage: number;
  totalAvailableTime: number;
  totalDowntime: number;
  totalChanges: number;
  lastDown?: Date;
  lastChange?: Date;
  lastCheck?: Date;
}

interface Link {
  id: number;
  url: string;
  provider_id: number;
  status: string;
  check_frequency: number;
  last_checked?: Date;
  first_available?: Date;
  last_available?: Date;
  created_at: Date;
  updated_at: Date;
}

interface Props {
  onLinkSelect: (linkId: number) => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

const STATUS_META: Record<string, { label: string; dot: string; badge: string; text: string }> = {
  ACTIVE:     { label: 'Activo',      dot: '#10b981', badge: '#052e16', text: '#86efac' },
  DEAD:       { label: 'Caído',       dot: '#ef4444', badge: '#2d0a0a', text: '#fca5a5' },
  CHANGED:    { label: 'Cambiado',    dot: '#f59e0b', badge: '#2d1d00', text: '#fcd34d' },
  RESTRICTED: { label: 'Restringido', dot: '#f97316', badge: '#2d1200', text: '#fdba74' },
  ERROR:      { label: 'Error',       dot: '#dc2626', badge: '#2d0a0a', text: '#fca5a5' },
};

const STAT_CARDS = [
  {
    key: 'totalLinks',
    label: 'Total Enlaces',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    iconBg: '#2d1f5e',
    iconColor: '#a78bfa',
    valueColor: '#f1f5f9',
  },
  {
    key: 'activeLinks',
    label: 'Activos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    iconBg: '#052e16',
    iconColor: '#4ade80',
    valueColor: '#4ade80',
  },
  {
    key: 'deadLinks',
    label: 'Caídos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    iconBg: '#2d0a0a',
    iconColor: '#f87171',
    valueColor: '#f87171',
  },
  {
    key: 'availabilityPercentage',
    label: 'Disponibilidad',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    iconBg: '#0c1a3d',
    iconColor: '#60a5fa',
    valueColor: '#60a5fa',
    suffix: '%',
    decimals: 1,
  },
];

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, dot: '#94a3b8', badge: '#1e293b', text: '#cbd5e1' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: meta.badge, color: meta.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

export default function Dashboard({ onLinkSelect, refreshTrigger, onRefresh }: Props) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({});
  const [providerStatistics, setProviderStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadData(); }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, linksData, statusDistData, providerStatsData] = await Promise.all([
        api.getOverallStatistics(),
        api.getLinks(),
        api.getStatusDistribution(),
        api.getProviderStatistics(),
      ]);
      setStatistics(statsData.data);
      setLinks(linksData.data);
      setStatusDistribution(statusDistData.data);
      setProviderStatistics(providerStatsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = filter === 'all' ? links : links.filter(l => l.status === filter);

  const getStatValue = (card: typeof STAT_CARDS[0]) => {
    if (!statistics) return '—';
    const raw = statistics[card.key as keyof Statistics] as number;
    if (raw == null) return '0';
    const val = card.decimals ? raw.toFixed(card.decimals) : raw;
    return `${val}${card.suffix ?? ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-purple-900" />
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div
            key={card.key}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#16161f', border: '1px solid #2a2a3a' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>{card.label}</p>
              <p className="text-2xl font-bold leading-none" style={{ color: card.valueColor }}>
                {getStatValue(card)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <StatisticsCharts
        statusDistribution={statusDistribution}
        providerStatistics={providerStatistics}
      />

      {/* Links Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>

        {/* Table header */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #2a2a3a' }}>
          <h2 className="font-semibold" style={{ color: '#f1f5f9' }}>
            Enlaces Monitoreados
            {links.length > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-normal" style={{ background: '#2a2a3a', color: '#94a3b8' }}>
                {links.length}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="text-sm rounded-lg px-3 py-2 outline-none transition-colors"
              style={{ background: '#0f0f14', border: '1px solid #2a2a3a', color: '#cbd5e1' }}
            >
              <option value="all">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="DEAD">Caído</option>
              <option value="CHANGED">Cambiado</option>
              <option value="RESTRICTED">Restringido</option>
              <option value="ERROR">Error</option>
            </select>
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg transition-colors hover:scale-105 active:scale-95"
              style={{ background: '#0f0f14', border: '1px solid #2a2a3a', color: '#94a3b8' }}
              title="Actualizar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                {['URL', 'Estado', 'Última verificación', 'Frecuencia', ''].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#475569', background: '#12121a' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link, i) => (
                <tr
                  key={link.id}
                  onClick={() => onLinkSelect(link.id)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: i < filteredLinks.length - 1 ? '1px solid #1e1e2e' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1e1e2e')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: STATUS_META[link.status]?.dot ?? '#94a3b8' }}
                      />
                      <span className="text-sm truncate" style={{ color: '#cbd5e1' }}>{link.url}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={link.status} />
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>
                    {link.last_checked ? new Date(link.last_checked).toLocaleString('es') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>
                    {link.check_frequency} min
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); onLinkSelect(link.id); }}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: '#a78bfa' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}
                    >
                      Ver detalles →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1e1e2e' }}>
              <svg className="w-6 h-6" style={{ color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: '#475569' }}>No hay enlaces. ¡Agrega el primero!</p>
          </div>
        )}
      </div>
    </div>
  );
}
