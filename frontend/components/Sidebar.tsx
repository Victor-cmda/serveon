import { useState } from "react";
import { Text, Title } from "@tremor/react";
import {
    HomeIcon,
    CustomersIcon,
    ProductsIcon,
    InvoicesIcon,
    SettingsIcon
} from "./Icons";

interface MenuItem {
    id: string;
    title: string;
    icon: React.FC;
    path: string;
}

const mainMenuItems: MenuItem[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: HomeIcon,
        path: "/",
    },
    {
        id: "customers",
        title: "Clientes",
        icon: CustomersIcon,
        path: "/clientes",
    },
    {
        id: "products",
        title: "Produtos",
        icon: ProductsIcon,
        path: "/produtos",
    },
    {
        id: "invoices",
        title: "Notas Fiscais",
        icon: InvoicesIcon,
        path: "/notas-fiscais",
    },
];

const settingsMenuItems: MenuItem[] = [
    {
        id: "settings",
        title: "Configurações",
        icon: SettingsIcon,
        path: "/configuracoes",
    },
];

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState("dashboard");

    return (
        <aside
            id="sidebar"
            className="fixed left-0 top-0 z-20 flex h-full w-64 flex-shrink-0 flex-col pt-16 font-normal transition-width duration-75 lg:flex"
            aria-label="Sidebar"
        >
            <div className="relative flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white pt-0">
                <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
                    <div className="flex-1 space-y-1 bg-white px-3">
                        {mainMenuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`group flex w-full items-center rounded-lg p-2 text-base ${activeItem === item.id
                                    ? "bg-gray-100 text-blue-600"
                                    : "text-gray-900 hover:bg-gray-100"
                                    }`}
                                onClick={() => setActiveItem(item.id)}
                            >
                                <item.icon />
                                <Text className="ml-3">{item.title}</Text>
                            </button>
                        ))}

                        <div className="pt-5 mt-5 space-y-2 border-t border-gray-200">
                            <Title className="px-3 text-xs font-semibold uppercase text-gray-500">
                                Administração
                            </Title>
                            {settingsMenuItems.map((item) => (
                                <button
                                    key={item.id}
                                    className={`group flex w-full items-center rounded-lg p-2 text-base ${activeItem === item.id
                                        ? "bg-gray-100 text-blue-600"
                                        : "text-gray-900 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setActiveItem(item.id)}
                                >
                                    <item.icon />
                                    <Text className="ml-3">{item.title}</Text>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;