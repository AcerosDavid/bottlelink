import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface LinkDetailsData {
  link: {
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
  };
  provider?: { id: number; name: string; type: string };
  fileMetadata?: any;
  recentChecks: any[];
  recentEvents: any[];
}

interface Props {
  linkId: number;
  onBack: () => void;
  onRefresh: () => void;
}

const STATUS_META: Record<string, { label: string; dot: string; badge: string; text: string }> = {
  ACTIVE:     { label: 'Activo',      dot: '#10b981', badge: '#052e16', text: '#86efac' },
  DEAD:       { label: 'Caído',       dot: '#ef4444', badge: '#2d0a0a', text: '#fca5a5' },
  CHANGED:    { label: 'Cambiado',    dot: '#f59e0b', badge: '#2d1d00', text: '#fcd34d' },
  RESTRICTED: { label: 'Restringido', dot: '#f97316', badge: '#2d1200', text: '#fdba74' },
  ERROR:      { label: 'Error',       dot: '#dc2626', badge: '#2d0a0a', text: '#fca5a5' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, dot: '#94a3b8', badge: '#1e293b', text: '#cbd5e1' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: meta.badge, color: meta.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
      <h2 className="font-semibold mb-5 flex items-center gap-2" style={{ color: '#f1f5f9' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#475569' }}>{label}</p>
      <div className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{value}</div>
    </div>
  );
}

export default function LinkDetails({ linkId, onBack, onRefresh }: Props) {
  const [details, setDetails] = useState<LinkDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => { loadDetails(); }, [linkId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getLink(linkId);
      setDetails(data.data);
    } catch (error) {
      console.error('Error loading link details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    try {
      setChecking(true);
      await api.checkLink(linkId);
      await loadDetails();
      onRefresh();
    } catch (error) {
      console.error('Error checking link:', error);
    } finally {
      setChecking(false);
    }
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

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#1e1e2e' }}>
          <svg className="w-7 h-7" style={{ color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: '#475569' }}>Enlace no encontrado</p>
        <button
          onClick={onBack}
          className="text-sm font-semibold transition-colors"
          style={{ color: '#a78bfa' }}
        >
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </button>
        <button
          onClick={handleCheckNow}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff' }}
        >
          {checking ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Verificar ahora
            </>
          )}
        </button>
      </div>

      {/* URL banner */}
      <div
        className="rounded-2xl px-6 py-4 flex items-center gap-4"
        style={{ background: '#16161f', border: '1px solid #2a2a3a' }}
      >
        <StatusBadge status={details.link.status} />
        <p className="text-sm flex-1 truncate" style={{ color: '#94a3b8' }}>{details.link.url}</p>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1e1e2e', color: '#64748b' }}>
          {details.provider?.name ?? 'Desconocido'}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Información del Enlace">
          <InfoRow label="URL" value={<span className="break-all text-xs font-mono" style={{ color: '#a78bfa' }}>{details.link.url}</span>} />
          <InfoRow label="Proveedor" value={details.provider?.name ?? 'Desconocido'} />
          <InfoRow label="Frecuencia" value={`${details.link.check_frequency} minutos`} />
          <InfoRow label="Creado" value={new Date(details.link.created_at).toLocaleString('es')} />
        </InfoCard>

        <InfoCard title="Disponibilidad">
          <InfoRow label="Última verificación" value={details.link.last_checked ? new Date(details.link.last_checked).toLocaleString('es') : 'Nunca'} />
          <InfoRow label="Primer disponible" value={details.link.first_available ? new Date(details.link.first_available).toLocaleString('es') : 'Nunca'} />
          <InfoRow label="Último disponible" value={details.link.last_available ? new Date(details.link.last_available).toLocaleString('es') : 'Nunca'} />
          <InfoRow label="Actualizado" value={new Date(details.link.updated_at).toLocaleString('es')} />
        </InfoCard>
      </div>

      {/* File Metadata */}
      {details.fileMetadata && (
        <InfoCard title="Metadatos del Archivo">
          <div className="grid grid-cols-2 gap-x-8">
            {[
              { key: 'name', label: 'Nombre' },
              { key: 'mime_type', label: 'Tipo MIME' },
              { key: 'video_codec', label: 'Codec Video' },
              { key: 'audio_codec', label: 'Codec Audio' },
              { key: 'resolution', label: 'Resolución' },
            ].filter(f => details.fileMetadata[f.key]).map(f => (
              <InfoRow key={f.key} label={f.label} value={details.fileMetadata[f.key]} />
            ))}
            {details.fileMetadata.size && (
              <InfoRow label="Tamaño" value={`${(details.fileMetadata.size / 1024 / 1024).toFixed(2)} MB`} />
            )}
            {details.fileMetadata.duration && (
              <InfoRow
                label="Duración"
                value={`${Math.floor(details.fileMetadata.duration / 60)}:${Math.floor(details.fileMetadata.duration % 60).toString().padStart(2, '0')}`}
              />
            )}
          </div>
        </InfoCard>
      )}

      {/* Recent Checks */}
      <InfoCard title="Verificaciones Recientes">
        <div className="space-y-2">
          {details.recentChecks.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#475569' }}>Sin verificaciones registradas</p>
          ) : details.recentChecks.map(check => (
            <div
              key={check.id}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: '#0f0f14', border: '1px solid #1e1e2e' }}
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={check.status} />
                <span className="text-sm" style={{ color: '#64748b' }}>
                  {new Date(check.checked_at).toLocaleString('es')}
                </span>
              </div>
              {check.response_time && (
                <span
                  className="text-xs font-mono px-2 py-1 rounded-lg"
                  style={{ background: '#1e1e2e', color: '#94a3b8' }}
                >
                  {check.response_time}ms
                </span>
              )}
            </div>
          ))}
        </div>
      </InfoCard>

      {/* Recent Events */}
      <InfoCard title="Eventos Recientes">
        <div className="space-y-2">
          {details.recentEvents.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#475569' }}>Sin eventos registrados</p>
          ) : details.recentEvents.map(event => (
            <div
              key={event.id}
              className="rounded-xl px-4 py-3"
              style={{ background: '#0f0f14', border: '1px solid #1e1e2e' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#2d1f5e', color: '#c4b5fd' }}
                >
                  {event.event_type}
                </span>
                <span className="text-xs" style={{ color: '#475569' }}>
                  {new Date(event.created_at).toLocaleString('es')}
                </span>
              </div>
              {event.description && (
                <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}
