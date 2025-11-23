import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Typography, Box } from '@mui/material'
import Navbar from './components/Navbar'
import Pedir from './pages/Pedir'
import Lista from './pages/Lista'
import Privado from './pages/Privado'

// Placeholder components
const NotFound = () => (
  <Box sx={{ my: 4 }}>
    <Typography variant="h2" component="h2" gutterBottom>
      404 - Página no encontrada
    </Typography>
  </Box>
)

import { ChildProvider } from './context/ChildContext'

function App() {
  return (
    <ChildProvider>
      <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/pedir" replace />} />
          <Route path="/pedir" element={<Pedir />} />
          <Route path="/lista" element={<Lista />} />
          <Route path="/privado" element={<Privado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Navbar />
    </ChildProvider>
  )
}

export default App
