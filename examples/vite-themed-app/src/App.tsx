import { useState, useEffect } from 'react';
// @ts-ignore
import { ThemeProvider, Button, Card, Modal, TdpNavigationProvider, TDPLink, tdpPaths } from '@tetrascience-npm/tetrascience-react-ui';

// Types for provider data
interface Provider {
  name: string;
  type: string;
  iconUrl: string | null;
  availableFields: string[];
}

interface QueryResult {
  data: Record<string, unknown>[];
  rowCount: number;
  mock?: boolean;
  message?: string;
  provider?: string;
  table?: string;
}

// Allowlist of tables that can be queried (must match server)
const ALLOWED_TABLES = ['files', 'samples', 'experiments', 'results'] as const;

// Color palette - easy to identify and change
const COLORS = {
  orange: '#F59E0B',
  orangeDark: '#D97706',
  orangeDarker: '#B45309',

  blue: '#3B82F6',
  blueDark: '#2563EB',
  blueDarker: '#1D4ED8',

  purple: '#9333EA',
  purpleDark: '#7E22CE',
  purpleDarker: '#6B21A8',

  green: '#10B981',
  greenDark: '#059669',
  greenDarker: '#047857',

  red: '#EF4444',
  redDark: '#DC2626',
  redDarker: '#B91C1C',

  brown: '#92400E',
  brownDark: '#78350F',
  brownDarker: '#451A03',

  white: '#FFFFFF',
  greyLight: '#E5E7EB',
};

// Custom theme
const customTheme = {
  colors: {
    primary: COLORS.blue,
    primaryHover: COLORS.redDark,
    primaryActive: COLORS.greenDarker,
    cardBackground: COLORS.white,
    cardBorder: COLORS.greyLight,
  },
  radius: {
    medium: '10px',
    large: '16px',
  },
};


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>(ALLOWED_TABLES[0]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Fetch environment config and providers on mount
  useEffect(() => {
    fetch('/api/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch((err) => console.error('Failed to fetch providers:', err));
  }, []);

  // Fetch data from a table
  const fetchTableData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '10' });
      if (selectedProvider) {
        params.set('provider', selectedProvider);
      }
      const res = await fetch(`/api/tables/${selectedTable}?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Query failed');
      } else {
        setQueryResult(data);
      }
    } catch (err) {
      setError('Failed to fetch table data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
    <TdpNavigationProvider>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>
            TetraScience UI Kit - Themed Demo
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>
            Showcasing Button, Card, and Modal with custom theme
          </p>
        </div>

        {/* Button Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
            Button Component
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Button variant="primary" size="medium">
              Primary Button
            </Button>
            <Button variant="secondary" size="medium">
              Secondary Button
            </Button>
            <Button variant="tertiary" size="medium">
              Tertiary Button
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="small">
              Small
            </Button>
            <Button variant="primary" size="medium">
              Medium
            </Button>
            <Button variant="primary" size="medium" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Card Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
            Card Component
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <Card title="Active Experiments" variant="elevated" size="medium">
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#F59E0B', marginBottom: '8px' }}>
                  12
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                  Currently running
                </p>
                <Button variant="primary" size="small" onClick={() => setIsModalOpen(true)}>
                  View Details
                </Button>
              </div>
            </Card>

            <Card title="Temperature" variant="elevated" size="medium">
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#9333EA', marginBottom: '8px' }}>
                  26.8°C
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                  ↑ 2.3% from yesterday
                </p>
                <Button variant="primary" size="small" onClick={() => setIsModalOpen(true)}>
                  View Details
                </Button>
              </div>
            </Card>

            <Card title="Data Points" variant="elevated" size="medium">
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>
                  1.2M
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                  Last 24 hours
                </p>
                <Button variant="primary" size="small" onClick={() => setIsModalOpen(true)}>
                  View Details
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Data Providers Demo */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
            Data App Providers (Server-Side)
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Connect to Snowflake, Databricks, or Athena using the provider helpers.
          </p>

          {/* Provider and Table Selectors */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '200px',
              }}
            >
              <option value="">Select a provider...</option>
              {providers.map((provider) => (
                <option key={provider.name} value={provider.name}>
                  {provider.name} ({provider.type})
                </option>
              ))}
            </select>

            <label style={{ fontWeight: '500', color: '#374151' }}>Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {ALLOWED_TABLES.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              size="medium"
              onClick={fetchTableData}
              disabled={isLoading || !selectedProvider}
            >
              {isLoading ? 'Fetching...' : 'Fetch Data'}
            </Button>
          </div>

          {/* Selected Provider Details */}
          {selectedProvider && (() => {
            const provider = providers.find((p) => p.name === selectedProvider);
            return provider && provider.availableFields.length > 0 ? (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                  Fields:
                </span>
                {provider.availableFields.map((field) => (
                  <span
                    key={field}
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '4px',
                      color: '#6B7280',
                    }}
                  >
                    {field}
                  </span>
                ))}
              </div>
            ) : null;
          })()}

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#FEE2E2',
              borderRadius: '8px',
              color: COLORS.redDark,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Query Results */}
          {queryResult && (
            <div style={{ marginTop: '16px' }}>
              {queryResult.mock && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  color: COLORS.brown,
                }}>
                  💡 {queryResult.message}
                </div>
              )}
              <div style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#F3F4F6',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                }}>
                  Results ({queryResult.rowCount} rows)
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {queryResult.data[0] && Object.keys(queryResult.data[0]).map((key) => (
                          <th key={key} style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            borderBottom: '1px solid #E5E7EB',
                            fontWeight: '600',
                            fontSize: '13px',
                            color: '#374151',
                          }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.data.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid #E5E7EB',
                              fontSize: '14px',
                            }}>
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TDP Navigation Demo */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
            TDP Navigation
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            Navigate to TDP pages using <code>TDPLink</code> and <code>tdpPaths</code> helpers.
            In production (iframe), URLs are resolved from <code>document.referrer</code>.
            Locally, they fall back to the <code>TDP_ENDPOINT</code> environment variable.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <TDPLink path={tdpPaths.fileDetails('example-file-id')}>
              View File Details
            </TDPLink>
            <TDPLink path={tdpPaths.search('chromatography')}>
              Search TDP
            </TDPLink>
            <TDPLink path={tdpPaths.dataWorkspace()}>
              Open Data Workspace
            </TDPLink>
            <TDPLink path={tdpPaths.pipelineEdit('example-pipeline-id')}>
              Edit Pipeline
            </TDPLink>
          </div>
        </div>

        {/* Modal Example */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            console.log('Confirmed!');
            setIsModalOpen(false);
          }}
          onCloseLabel="Close"
          onConfirmLabel="Download Report"
          title="Detailed Information"
          width="600px"
        >
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              Modal Component
            </h3>
            <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
              This modal is also themed! Notice:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '16px', lineHeight: '1.8' }}>
              <li>Custom orange primary button</li>
              <li>Rounded corners from theme</li>
              <li>Consistent styling throughout</li>
            </ul>
            <div style={{
              padding: '16px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px',
              border: '1px solid #F59E0B'
            }}>
              <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
                💡 <strong>Theme Applied:</strong> All components use the custom orange theme!
              </p>
            </div>
          </div>
        </Modal>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: '#F3F4F6',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
            Built with <strong>TetraScience UI Kit</strong> • Custom Orange Theme
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Theme: { JSON.stringify({ primary: '#F59E0B', radius: '10px/16px' }) }
          </p>
        </div>
      </div>
    </TdpNavigationProvider>
    </ThemeProvider>
  );
}

export default App;
