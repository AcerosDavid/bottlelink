import { useState } from 'react';
import { api } from '../utils/api';

interface Props {
  onClose: () => void;
  onLinkAdded: () => void;
}

const PROVIDERS = ['MEGA', 'MediaFire', 'Google Drive', 'Dropbox', 'OneDrive', 'Pixeldrain', 'HTTP/S'];

export default function AddLinkModal({ onClose, onLinkAdded }: Props) {
  const [url, setUrl] = useState('');
  const [checkFrequency, setCheckFrequency] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) { setError('La URL es requerida'); return; }
    try {
      setLoading(true);
      await api.createLink({ url: url.trim(), check_frequency: checkFrequency });
      onLinkAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#16161f', border: '1px solid #2a2a3a' }}
      >
        {/* Modal header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #2a2a3a' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="font-semibold" style={{ color: '#f1f5f9' }}>Agregar Nuevo Enlace</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#64748b', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e1e2e')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              URL del enlace
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://mega.nz/file/..."
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-600"
              style={{
                background: '#0f0f14',
                border: '1px solid #2a2a3a',
                color: '#e2e8f0',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2a2a3a')}
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Frecuencia de verificación
            </label>
            <div className="relative">
              <input
                type="number"
                id="frequency"
                value={checkFrequency}
                onChange={e => setCheckFrequency(parseInt(e.target.value) || 60)}
                min="1"
                max="1440"
                disabled={loading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-16"
                style={{
                  background: '#0f0f14',
                  border: '1px solid #2a2a3a',
                  color: '#e2e8f0',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#7c3aed')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2a2a3a')}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: '#475569' }}
              >
                min
              </span>
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#475569' }}>Entre 1 y 1440 minutos (24h)</p>
          </div>

          {/* Providers chips */}
          <div className="rounded-xl p-4" style={{ background: '#0f0f14', border: '1px solid #1e1e2e' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>
              Proveedores soportados
            </p>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map(p => (
                <span
                  key={p}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: '#1e1e2e', color: '#94a3b8', border: '1px solid #2a2a3a' }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: '#0f0f14', border: '1px solid #2a2a3a', color: '#94a3b8' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1e1e2e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0f0f14')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Agregando...
                </span>
              ) : 'Agregar Enlace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
