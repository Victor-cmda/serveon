import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="flex h-full w-full flex-col pt-16 md:pl-64">
                <main className="h-full overflow-y-auto p-4">
                    <div className="container mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default Layout;