import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { positionApi, departmentApi } from '../../services/api';
import { Position } from '../../types/position';
import { Department } from '../../types/department';
import { toast } from '../../lib/toast';

const PositionsList: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    loadPositions();
    loadDepartments();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await positionApi.getAll();
      setPositions(data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os cargos',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data.filter(dept => dept.ativo));
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
      try {
        await positionApi.delete(id);
        toast.success('Sucesso', {
          description: 'Cargo excluído com sucesso',
        });
        loadPositions();
      } catch (error) {
        console.error('Erro ao excluir cargo:', error);
        toast.error('Erro', {
          description: 'Não foi possível excluir o cargo',
        });
      }
    }
  };
  const filteredPositions = positions.filter(
    position => {
      const matchesSearch = position.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.id.toString().includes(searchTerm) ||
        (position.descricao && position.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (position.departamentoNome && position.departamentoNome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = selectedDepartment === '' || 
        position.departamentoId?.toString() === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Cargos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os cargos da empresa
          </p>
        </div>
        <Link
          to="/positions/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo Cargo
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar cargos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos os departamentos</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id.toString()}>
              {department.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Código
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Descrição
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Departamento
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Criado em
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedDepartment ? 'Nenhum cargo encontrado.' : 'Nenhum cargo cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPositions.map((position) => (
                  <tr key={position.id} className="border-b">
                    <td className="p-4">
                      <div className="font-mono text-sm text-muted-foreground">{position.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{position.nome}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {position.descricao || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {position.departamentoNome || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(position.createdAt)}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          position.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {position.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/positions/edit/${position.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(position.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPositions.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPositions.length} de {positions.length} cargo(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionsList;
