// src/Routes.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import CountriesList from './pages/countries/CountriesList';
import CountryForm from './pages/countries/CountryForm';
import StatesList from './pages/states/StatesList';
import StateForm from './pages/states/StateForm';
import CitiesList from './pages/cities/CitiesList';
import CityForm from './pages/cities/CityForm';
import NotFound from './pages/notfound/NotFound';
import CustomersList from './pages/customers/CustomersList';
import CustomerForm from './pages/customers/CustomerForm';
import SuppliersList from './pages/suppliers/SuppliersList';
import SupplierForm from './pages/suppliers/SupplierForm';
import PaymentMethodsList from './pages/payment-methods/PaymentMethodsList';
import PaymentMethodForm from './pages/payment-methods/PaymentMethodForm';
import PaymentTermsList from './pages/payment-terms/PaymentTermsList';
import PaymentTermForm from './pages/payment-terms/PaymentTermForm';
import EmployeesList from './pages/employees/EmployeesList';
import EmployeeForm from './pages/employees/EmployeeForm';
import DepartmentsList from './pages/departments/DepartmentsList';
import DepartmentForm from './pages/departments/DepartmentForm';
import PositionsList from './pages/positions/PositionsList';
import PositionForm from './pages/positions/PositionForm';
import { FormStateProvider } from './contexts/FormStateContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      //Clientes
      {
        path: 'customers',
        element: <CustomersList />,
      },
      {
        path: 'customers/new',
        element: <CustomerForm />,
      },
      {
        path: 'customers/edit/:id',
        element: <CustomerForm />,
      },
      // Métodos de Pagamento
      {
        path: 'payment-methods',
        element: <PaymentMethodsList />,
      },
      {
        path: 'payment-methods/new',
        element: <PaymentMethodForm />,
      },
      {
        path: 'payment-methods/edit/:id',
        element: <PaymentMethodForm />,
      },
      // Condições de Pagamento
      {
        path: 'payment-terms',
        element: <PaymentTermsList />,
      },
      {
        path: 'payment-terms/new',
        element: <PaymentTermForm />,
      },
      {
        path: 'payment-terms/edit/:id',
        element: <PaymentTermForm />,
      },
      // Fornecedores
      {
        path: 'suppliers',
        element: <SuppliersList />,
      },
      {
        path: 'suppliers/new',
        element: <SupplierForm />,
      },      {
        path: 'suppliers/edit/:id',
        element: <SupplierForm />,
      },
      // Países
      {
        path: 'countries',
        element: <CountriesList />,
      },
      {
        path: 'countries/new',
        element: <CountryForm />,
      },
      {
        path: 'countries/edit/:id',
        element: <CountryForm />,
      },
      // Estados
      {
        path: 'states',
        element: <StatesList />,
      },
      {
        path: 'states/new',
        element: <StateForm />,
      },
      {
        path: 'states/edit/:id',
        element: <StateForm />,
      },
      // Cidades
      {
        path: 'cities',
        element: <CitiesList />,
      },
      {
        path: 'cities/new',
        element: <CityForm />,
      },      {
        path: 'cities/edit/:id',
        element: <CityForm />,
      },      // Funcionários
      {
        path: 'employees',
        element: <EmployeesList />,
      },
      {
        path: 'employees/new',
        element: <EmployeeForm />,
      },
      {
        path: 'employees/edit/:id',
        element: <EmployeeForm />,
      },
      // Departamentos
      {
        path: 'departments',
        element: <DepartmentsList />,
      },
      {
        path: 'departments/new',
        element: <DepartmentForm />,
      },
      {
        path: 'departments/edit/:id',
        element: <DepartmentForm />,
      },
      // Cargos
      {
        path: 'positions',
        element: <PositionsList />,
      },
      {
        path: 'positions/new',
        element: <PositionForm />,
      },
      {
        path: 'positions/edit/:id',
        element: <PositionForm />,
      },
      // Rota de fallback
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

const Routes = () => {
  return (
    <FormStateProvider>
      <RouterProvider router={router} />
    </FormStateProvider>
  );
};

export default Routes;
