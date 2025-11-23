import { Routes, Route } from 'react-router-dom'
import { Container, Typography, Box } from '@mui/material'
import Navbar from './components/Navbar'
import Pedir from './pages/Pedir'
import Lista from './pages/Lista'
import Privado from './pages/Privado'

// Placeholder components
const Home = () => (
  <Box sx={{ my: 4 }}>
    <Typography variant="h1" component="h1" gutterBottom>
      Reyes Magos
    </Typography>
    <Typography variant="body1">
      Bienvenido a la aplicación de Reyes Magos.
    </Typography>
  </Box>
)

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
      <Container maxWidth="sm" sx={{ pb: 7 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pedir" element={<Pedir />} />
          <Route path="/lista" element={<Lista />} />
          <Route path="/privado" element={<Privado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Navbar />
    </ChildProvider>
  )
}

export default App
