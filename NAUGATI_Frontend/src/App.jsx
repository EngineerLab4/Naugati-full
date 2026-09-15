import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import ProtectedRoute from './components/ProtectedRoute';
import StarkExperience from './components/StarkExperience';
import LiveMarketPage from './pages/LiveMarketPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ShipmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StarkExperience />} />
            <Route path="/about" element={<StarkExperience />} />
            <Route path="/how-it-works" element={<StarkExperience />} />
            <Route path="/solutions" element={<StarkExperience />} />
            <Route path="/live-market" element={<LiveMarketPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ShipmentProvider>
    </AuthProvider>
  );
}

export default App;
