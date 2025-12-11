import { useState } from 'react';
// @ts-ignore
import { ThemeProvider, Button, Card, Modal } from '@tetrascience-npm/tetrascience-react-ui';

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

  return (
    <ThemeProvider theme={customTheme}>
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
    </ThemeProvider>
  );
}

export default App;
