import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from './ui/sonner';

const Layout = () => {
  return (
    <div className="layout-container flex h-screen bg-muted/20 overflow-hidden">
      <Navbar />
      <Sidebar />
      <div className="flex h-full w-full flex-col pt-16 md:pl-64 overflow-hidden">
        <main className="h-full overflow-y-auto p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
