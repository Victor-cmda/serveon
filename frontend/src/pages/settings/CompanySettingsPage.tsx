import { useState, useEffect } from 'react';
import { Save, Building2, AlertCircle } from 'lucide-react';
import { companySettingsApi } from '@/services/api';
import { CompanySettings } from '@/types/company-settings';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogoUpload } from '@/components/LogoUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const CompanySettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    website: '',
    logoBase64: '',
    regimeTributario: 'SIMPLES_NACIONAL',
    observacoesFiscais: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await companySettingsApi.get();
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('404')) {
        toast.error('Erro ao carregar configurações');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (
      !settings.razaoSocial ||
      !settings.cnpj ||
      !settings.endereco ||
      !settings.cidade ||
      !settings.estado ||
      !settings.telefone ||
      !settings.email
    ) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await companySettingsApi.update(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleCEPComplete = async (data: any) => {
    setSettings(prev => ({
      ...prev,
      endereco: data.logradouro || prev.endereco,
      bairro: data.bairro || prev.bairro,
      cidade: data.localidade || prev.cidade,
      estado: data.uf || prev.estado,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configurações da Empresa
            </h1>
            <p className="text-muted-foreground">
              Configure os dados da empresa para documentos fiscais
            </p>
          </div>
        </div>
      </div>

      {/* Alert informativo */}
      <div className="flex items-start gap-3 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Informações para Documentos Fiscais
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            Estas informações serão utilizadas na geração de notas fiscais, boletos e demais documentos do sistema.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid gap-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>
              Informações básicas de identificação da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">
                  Razão Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="razaoSocial"
                  value={settings.razaoSocial}
                  onChange={(e) =>
                    setSettings({ ...settings, razaoSocial: e.target.value })
                  }
                  placeholder="Ex: ServeOn Tecnologia Ltda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={settings.nomeFantasia || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, nomeFantasia: e.target.value })
                  }
                  placeholder="Ex: ServeOn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cnpj"
                  value={settings.cnpj}
                  onChange={(e) =>
                    setSettings({ ...settings, cnpj: e.target.value })
                  }
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscricaoEstadual"
                  value={settings.inscricaoEstadual || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      inscricaoEstadual: e.target.value,
                    })
                  }
                  placeholder="000.000.000.000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscricaoMunicipal"
                  value={settings.inscricaoMunicipal || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      inscricaoMunicipal: e.target.value,
                    })
                  }
                  placeholder="000.000.000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimeTributario">Regime Tributário</Label>
                <Select
                  value={settings.regimeTributario || 'SIMPLES_NACIONAL'}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, regimeTributario: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLES_NACIONAL">
                      Simples Nacional
                    </SelectItem>
                    <SelectItem value="LUCRO_PRESUMIDO">
                      Lucro Presumido
                    </SelectItem>
                    <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Localização física da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cep"
                  value={settings.cep}
                  onChange={(e) => setSettings({ ...settings, cep: e.target.value })}
                  onBlur={async (e) => {
                    const cep = e.target.value.replace(/\D/g, '');
                    if (cep.length === 8) {
                      try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await response.json();
                        if (!data.erro) {
                          handleCEPComplete(data);
                        }
                      } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                      }
                    }
                  }}
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">
                  Endereço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endereco"
                  value={settings.endereco}
                  onChange={(e) =>
                    setSettings({ ...settings, endereco: e.target.value })
                  }
                  placeholder="Rua, Avenida, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">
                  Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero"
                  value={settings.numero}
                  onChange={(e) =>
                    setSettings({ ...settings, numero: e.target.value })
                  }
                  placeholder="123"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={settings.complemento || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, complemento: e.target.value })
                  }
                  placeholder="Sala, Andar, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bairro"
                  value={settings.bairro}
                  onChange={(e) =>
                    setSettings({ ...settings, bairro: e.target.value })
                  }
                  placeholder="Centro, Jardim, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cidade"
                  value={settings.cidade}
                  onChange={(e) =>
                    setSettings({ ...settings, cidade: e.target.value })
                  }
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estado"
                  value={settings.estado}
                  onChange={(e) =>
                    setSettings({ ...settings, estado: e.target.value })
                  }
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
            <CardDescription>
              Informações de contato da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefone"
                  value={settings.telefone}
                  onChange={(e) =>
                    setSettings({ ...settings, telefone: e.target.value })
                  }
                  placeholder="(11) 1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  placeholder="contato@empresa.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, website: e.target.value })
                  }
                  placeholder="https://www.empresa.com.br"
                />
              </div>
            </div>

            <div className="pt-4">
              <LogoUpload
                value={settings.logoBase64}
                onChange={(base64) =>
                  setSettings({ ...settings, logoBase64: base64 })
                }
                label="Logo da Empresa"
                maxSize={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Observações Fiscais */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Fiscais</CardTitle>
            <CardDescription>
              Informações adicionais para documentos fiscais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoesFiscais">
                Observações (aparecerá nos documentos)
              </Label>
              <Textarea
                id="observacoesFiscais"
                value={settings.observacoesFiscais || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    observacoesFiscais: e.target.value,
                  })
                }
                placeholder="Ex: Empresa optante pelo Simples Nacional conforme Lei Complementar nº 123/2006"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[150px]"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;
