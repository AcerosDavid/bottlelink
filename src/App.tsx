import { useState } from 'react';
import Dashboard from './components/Dashboard';
import LinkDetails from './components/LinkDetails';
import AddLinkModal from './components/AddLinkModal';

function App() {
  const [selectedLink, setSelectedLink] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLinkSelect = (linkId: number) => setSelectedLink(linkId);
  const handleBackToDashboard = () => setSelectedLink(null);
  const handleLinkAdded = () => { setShowAddModal(false); setRefreshTrigger(prev => prev + 1); };
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="min-h-screen" style={{ background: '#0f0f14' }}>

      {/* Header */}
      <header style={{ background: '#16161f', borderBottom: '1px solid #2a2a3a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logobottlelink.png"
                alt="BottleLink Logo"
                className="w-14 h-14"
              />
              <div>
                <h1 className="text-lg font-bold leading-none" style={{ color: '#6810c1' }}>BottleLink</h1>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Monitor de enlaces</p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Enlace
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedLink ? (
          <LinkDetails
            linkId={selectedLink}
            onBack={handleBackToDashboard}
            onRefresh={handleRefresh}
          />
        ) : (
          <Dashboard
            onLinkSelect={handleLinkSelect}
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      {showAddModal && (
        <AddLinkModal
          onClose={() => setShowAddModal(false)}
          onLinkAdded={handleLinkAdded}
        />
      )}
    </div>
  );
}

export default App;
