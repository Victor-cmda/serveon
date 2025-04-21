import Routes from './Routes'
import { ThemeProvider } from 'next-themes'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Routes />
    </ThemeProvider>
  )
}

export default App