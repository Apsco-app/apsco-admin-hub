// src/components/Sidebar.tsx (Save as .tsx)
import React from 'react';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { name: 'Dashboard', key: 'dashboard' },
        { name: 'Applicants', key: 'applicants' },
        { name: 'Classes', key: 'classes' },
        { name: 'Admissions', key: 'admissions' },
        { name: 'Analytics', key: 'analytics' },
        { name: 'Settings', key: 'settings' },
    ];

    return (
        <nav className="w-64 bg-white shadow-xl flex flex-col p-4">
            <h1 className="text-xl font-bold mb-8">APSCO</h1>
            <ul>
                {navItems.map((item) => (
                    <li key={item.key} className="mb-2">
                        <button
                            onClick={() => setActiveView(item.key)}
                            className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${
                                activeView === item.key
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;