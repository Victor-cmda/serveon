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
// Novos módulos
import ProductsList from './pages/products/ProductsList';
import ProductForm from './pages/products/ProductForm';
import CategoriesList from './pages/categories/CategoriesList';
import CategoryForm from './pages/categories/CategoryForm';
import BrandsList from './pages/brands/BrandsList';
import BrandForm from './pages/brands/BrandForm';
import UnitMeasuresList from './pages/unit-measures/UnitMeasuresList';
import UnitMeasureForm from './pages/unit-measures/UnitMeasureForm';
import TransportersList from './pages/transporters/TransportersList';
import TransporterForm from './pages/transporters/TransporterForm';
import PurchasesList from './pages/purchases/PurchasesList';
import NewPurchaseForm from './pages/purchases/NewPurchaseForm';
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
      // Compras
      {
        path: 'purchases',
        element: <PurchasesList />,
      },
      {
        path: 'purchases/new',
        element: <NewPurchaseForm />,
      },
      {
        path: 'purchases/edit/:id',
        element: <NewPurchaseForm />,
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
      },      {
        path: 'positions/edit/:id',
        element: <PositionForm />,
      },      // Produtos
      {
        path: 'products',
        element: <ProductsList />,
      },
      {
        path: 'products/new',
        element: <ProductForm />,
      },
      {
        path: 'products/edit/:id',
        element: <ProductForm />,
      },
      // Categorias
      {
        path: 'categories',
        element: <CategoriesList />,
      },
      {
        path: 'categories/new',
        element: <CategoryForm />,
      },
      {
        path: 'categories/edit/:id',
        element: <CategoryForm />,
      },
      // Marcas
      {
        path: 'brands',
        element: <BrandsList />,
      },
      {
        path: 'brands/new',
        element: <BrandForm />,
      },
      {
        path: 'brands/edit/:id',
        element: <BrandForm />,
      },
      // Unidades de Medida
      {
        path: 'unit-measures',
        element: <UnitMeasuresList />,
      },
      {
        path: 'unit-measures/new',
        element: <UnitMeasureForm />,
      },
      {
        path: 'unit-measures/edit/:id',
        element: <UnitMeasureForm />,
      },
      // Transportadoras
      {
        path: 'transporters',
        element: <TransportersList />,
      },
      {
        path: 'transporters/new',
        element: <TransporterForm />,
      },
      {
        path: 'transporters/edit/:id',
        element: <TransporterForm />,
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
