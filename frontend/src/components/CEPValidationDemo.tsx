import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form } from '../components/ui/form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import CEPField from '../components/CEPField';
import { toast } from '../lib/toast';

interface DemoFormData {
  nome: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
}

const CEPValidationDemo = () => {
  const form = useForm<DemoFormData>({
    defaultValues: {
      nome: '',
      endereco: '',
      numero: '',
      bairro: '',
      cep: '',
      cidade: '',
      uf: ''
    }
  });

  const handleAddressFound = (address: {
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) => {
    // Preenche automaticamente os campos encontrados
    form.setValue('endereco', address.endereco);
    form.setValue('bairro', address.bairro);
    form.setValue('cidade', address.cidade);
    form.setValue('uf', address.uf);
    
    toast.success(`Endereço encontrado para ${address.cidade}/${address.uf}!`);
  };

  const onSubmit = (data: DemoFormData) => {
    console.log('Dados do formulário:', data);
    toast.success('Formulário enviado com sucesso!');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração - Validação de CEP com API</CardTitle>
          <CardDescription>
            Digite um CEP válido para ver a validação em tempo real e o preenchimento automático dos campos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Digite seu nome"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CEP com validação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CEPField 
                  form={form}
                  onAddressFound={handleAddressFound}
                />
                
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Cidade"
                          className="h-10"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="UF"
                          className="h-10"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="md:col-span-8">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Rua, Avenida..."
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123"
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Bairro"
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Enviar Formulário
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                  className="flex-1"
                >
                  Limpar
                </Button>
              </div>

              {/* Instruções */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Como testar:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Digite um CEP válido (ex: 01310-100, 20040-020, 30112-000)</li>
                  <li>• Observe os indicadores visuais durante a validação</li>
                  <li>• Veja como os campos são preenchidos automaticamente</li>
                  <li>• Teste com CEPs inválidos para ver as mensagens de erro</li>
                </ul>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CEPValidationDemo;
