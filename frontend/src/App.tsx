import Layout from './components/Layout'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

function App() {
  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Serveon</CardTitle>
            <CardDescription>
              Sistema de gestão empresarial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Este é o dashboard principal do sistema.</p>
            <div className="mt-4">
              <Button>Começar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Gerenciamento de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Cadastre e gerencie seus clientes.</p>
            <div className="mt-4">
              <Button variant="outline">Ver clientes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais</CardTitle>
            <CardDescription>
              Emissão e controle de NFe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Emita e gerencie suas notas fiscais.</p>
            <div className="mt-4">
              <Button variant="outline">Ver notas</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default App