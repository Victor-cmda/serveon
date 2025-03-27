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

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
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
            },
            {
                path: 'cities/edit/:id',
                element: <CityForm />,
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
    return <RouterProvider router={router} />;
};

export default Routes;