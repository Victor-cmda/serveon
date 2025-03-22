import { Button, Title, TextInput } from "@tremor/react";
import { useState } from "react";
import { SearchIcon, BellIcon, UserIcon } from "./Icons";

const Navbar = () => {
    const [search, setSearch] = useState("");

    return (
        <nav className="bg-white border-b border-gray-200 fixed z-30 w-full">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <button
                            id="toggleSidebarMobile"
                            aria-expanded="true"
                            aria-controls="sidebar"
                            className="lg:hidden mr-2 text-gray-600 hover:text-gray-900 cursor-pointer p-2 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 rounded"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                        <Title className="text-xl flex items-center lg:ml-2.5">
                            <span className="font-semibold">Serveon</span>
                        </Title>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden lg:flex items-center">
                            <TextInput
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={SearchIcon}
                                className="max-w-xs"
                            />
                        </div>
                        <Button
                            size="xs"
                            variant="light"
                            icon={BellIcon}
                            className="ml-5 text-gray-500"
                        />
                        <Button
                            size="xs"
                            variant="light"
                            icon={UserIcon}
                            className="ml-3 text-gray-500"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;