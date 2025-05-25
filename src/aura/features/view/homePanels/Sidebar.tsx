// src/aura/components/Sidebar.tsx
"use client";

import React from "react";
import {
    BarChart3,
    Package,
    Users,
    TrendingUp,
    Home,
    MessageSquare,
    Settings,
    Layers,
    FileText,
    Table,
    ChevronRight,
    Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

interface MenuItem {
    icon: React.ComponentType<any>;
    label: string;
    active?: boolean;
    hasSubmenu?: boolean;
    onClick?: () => void;
}

const Sidebar: React.FC = () => {
    const { theme, setShowColorPanel, searchQuery, showColorPanel } = useTheme();
    const navigate = useNavigate();

    const handleColorsClick = () => {
        console.log("🎨 COLORS BUTTON CLICKED!");
        console.log("Current showColorPanel:", showColorPanel);
        setShowColorPanel(true);
        console.log("Called setShowColorPanel(true)");
    };

    const menuItems: MenuItem[] = [
        { icon: BarChart3, label: "Dashboard", active: true },
    ];

    const adminTools: MenuItem[] = [
        { icon: Package, label: "Products" },
        {
            icon: Users,
            label: "Conta",
            hasSubmenu: true,
            onClick: () => navigate("/features/view/conta"),
        },
         {
           icon: Home,
           label: "Lobby",
           onClick: () => navigate("/")
         },
    ];

    const insights: MenuItem[] = [
        { icon: TrendingUp, label: "Analytics" },
        {
            icon: MessageSquare,
            label: "Chat",
            onClick: () => navigate("/features/view/chat"),
        },
        { icon: Settings, label: "Settings", hasSubmenu: true },
    ];

    const elements: MenuItem[] = [
        { icon: Layers, label: "Components", hasSubmenu: true },
        { icon: FileText, label: "Forms", hasSubmenu: true },
        { icon: Table, label: "Tables", hasSubmenu: true },
    ];

    const themes: MenuItem[] = [
        {
            icon: Palette,
            label: "Colors",
            onClick: handleColorsClick,
        },
    ];

    const filterItems = (items: MenuItem[]) => {
        if (!searchQuery) return items;
        return items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderMenuSection = (title: string, items: MenuItem[]) => {
        const filtered = filterItems(items);
        if (searchQuery && filtered.length === 0) return null;

        return (
            <div className="mb-6">
                <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-all duration-300 hover:scale-105 transform ${
                        theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"
                    }`}
                    style={{
                        color: theme === "dark" ? "#6B7280" : "#4B5563",
                        textShadow: `0 0 10px var(--glow-color), 0 0 20px var(--glow-color)`,
                        filter: `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
                    }}
                >
                    {title}
                </h3>
                <nav className="space-y-1">
                    {filtered.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => item.onClick?.()}
                            className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm 
                transition-all duration-300 group relative overflow-hidden transform hover:scale-[1.02]
                ${
                                item.active
                                    ? "text-white shadow-lg"
                                    : theme === "dark"
                                        ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-blue-50/50"
                            }
              `}
                            style={{
                                background: item.active
                                    ? "var(--gradient-accent)"
                                    : "transparent",
                                boxShadow: item.active
                                    ? `0 0 20px var(--glow-color), 0 0 40px var(--glow-color)`
                                    : "none",
                            }}
                        >
                            {!item.active && (
                                <>
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                                        style={{
                                            background: `linear-gradient(90deg, var(--glow-color), transparent, var(--glow-color))`,
                                            opacity: 0.1,
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl scale-110"
                                        style={{
                                            background: `var(--glow-color)`,
                                            opacity: 0.05,
                                        }}
                                    />
                                </>
                            )}

                            <div className="flex items-center relative z-10">
                                <item.icon
                                    className="w-4 h-4 mr-3 transition-all duration-300 transform group-hover:scale-110"
                                    style={{
                                        filter: item.active
                                            ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))"
                                            : `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
                                        textShadow: item.active
                                            ? "0 0 15px rgba(255, 255, 255, 0.8)"
                                            : `0 0 12px var(--glow-color)`,
                                    }}
                                />
                                <span
                                    className={`transition-all duration-300 ${
                                        item.active ? "font-medium" : "group-hover:font-medium"
                                    }`}
                                    style={{
                                        textShadow: item.active
                                            ? "0 0 10px rgba(255, 255, 255, 0.6)"
                                            : `0 0 8px var(--glow-color)`,
                                        filter: `drop-shadow(0 0 6px var(--glow-color))`,
                                    }}
                                >
                  {item.label}
                </span>
                            </div>
                            {item.hasSubmenu && (
                                <ChevronRight
                                    className="w-4 h-4 relative z-10 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-90"
                                    style={{
                                        filter: `drop-shadow(0 0 6px var(--glow-color)) drop-shadow(0 0 12px var(--glow-color))`,
                                        textShadow: `0 0 8px var(--glow-color)`,
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        );
    };

    return (
        <div
            className="w-64 flex flex-col h-full border-r"
            style={{
                background:
                    theme === "dark"
                        ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
                        : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
                boxShadow: `0 0 20px var(--glow-color)`,
            }}
        >
            {/* Logo */}
            <div
                className="p-4 border-b"
                style={{
                    borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
                }}
            >
                <div className="flex items-center space-x-2 group cursor-pointer">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-12"
                        style={{
                            background: "var(--gradient-primary)",
                            boxShadow: `0 0 20px var(--glow-color), 0 0 40px var(--glow-color)`,
                        }}
                    >
            <span
                className="text-white font-bold text-sm transition-all duration-300 group-hover:scale-110"
                style={{
                    textShadow: "0 0 15px rgba(255, 255, 255, 1)",
                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
                }}
            >
              AU
            </span>
                    </div>
                    <span
                        className={`font-semibold transition-all duration-300 group-hover:scale-105 ${
                            theme === "dark"
                                ? "text-white group-hover:text-blue-400"
                                : "text-gray-900 group-hover:text-blue-600"
                        }`}
                        style={{
                            textShadow: `0 0 15px var(--glow-color)`,
                            filter: `drop-shadow(0 0 10px var(--glow-color))`,
                        }}
                    >
            AURA
          </span>
                </div>
            </div>

            {/* Search / Menu */}
            <div className="flex-1 p-4 overflow-y-auto">
                {searchQuery && (
                    <div className="mb-4">
                        <p
                            className={`text-xs ${
                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}
                            style={{ textShadow: `0 0 8px var(--glow-color)` }}
                        >
                            Search results for "{searchQuery}"
                        </p>
                    </div>
                )}

                {renderMenuSection("MENU", menuItems)}
                {renderMenuSection("TOOLS", adminTools)}
                {renderMenuSection("INSIGHTS", insights)}
                {renderMenuSection("ELEMENTS", elements)}
                {renderMenuSection("THEMES", themes)}

                {searchQuery &&
                    filterItems([
                        ...menuItems,
                        ...adminTools,
                        ...insights,
                        ...elements,
                        ...themes,
                    ]).length === 0 && (
                        <div className="text-center py-8">
                            <p
                                className={`text-sm ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                }`}
                                style={{ textShadow: `0 0 8px var(--glow-color)` }}
                            >
                                No results found for "{searchQuery}"
                            </p>
                        </div>
                    )}
            </div>

            {/* Upgrade Section */}
            <div
                className="p-4 border-t"
                style={{ borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0" }}
            >
                <div
                    className="rounded-xl p-4 space-y-3 group cursor-pointer transition-all duration-500 hover:scale-[1.02] relative overflow-hidden"
                    style={{
                        background:
                            theme === "dark"
                                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                                : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                        boxShadow: `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px var(--glow-color)`,
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, var(--glow-color), transparent, var(--glow-color))`,
                            opacity: 0.2,
                        }}
                    />

                    <div className="relative z-10">
                        <h4
                            className={`font-semibold text-sm mb-2 transition-all duration-300 group-hover:scale-105 ${
                                theme === "dark"
                                    ? "text-white group-hover:text-blue-300"
                                    : "text-gray-900 group-hover:text-blue-700"
                            }`}
                            style={{
                                textShadow: `0 0 15px var(--glow-color)`,
                                filter: `drop-shadow(0 0 10px var(--glow-color))`,
                            }}
                        >
                            EM DESENVOLVIMENTO!!!!!!!
                        </h4>
                        <p
                            className={`text-xs mb-4 transition-all duration-300 ${
                                theme === "dark"
                                    ? "text-gray-400 group-hover:text-gray-300"
                                    : "text-gray-600 group-hover:text-gray-700"
                            }`}
                            style={{
                                textShadow: `0 0 10px var(--glow-color)`,
                                filter: `drop-shadow(0 0 8px var(--glow-color))`,
                            }}
                        >
                            pix onnnn.
                        </p>
                        <button className="w-full relative overflow-hidden rounded-lg py-2.5 px-4 text-sm font-medium text-white transition-all duration-300 group/btn hover:scale-105">
                            <div
                                className="absolute inset-0 transition-all duration-300"
                                style={{
                                    background: "var(--gradient-accent)",
                                }}
                            />
                            <div
                                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: "var(--gradient-secondary)",
                                }}
                            />
                            <div
                                className="absolute inset-0 opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300 blur-lg scale-110"
                                style={{
                                    background: "var(--gradient-accent)",
                                }}
                            />
                            <span
                                className="relative z-10 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110"
                                style={{
                                    textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))",
                                }}
                            >
                <span
                    className="mr-2 transition-all duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-125"
                    style={{
                        filter: `drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px var(--glow-color))`,
                        textShadow: "0 0 15px rgba(255, 255, 255, 1)",
                    }}
                >
                  ⬆
                </span>
                Upgrade Now
              </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
