"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "./ThemeContext"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useChannelPermissions } from "../../../hooks/use-channel-permissions"

interface MenuItem {
  icon: React.ComponentType<any>
  label: string
  active?: boolean
  hasSubmenu?: boolean
  href?: string
  onClick?: () => void
  pageId?: string
}

const Sidebar = () => {
  const { theme, setShowColorPanel, searchQuery, glowEnabled, fadeEnabled, fadeMode, sidebarCollapsed } = useTheme()
  const { t } = useLanguage()
  const { hasPageAccess } = useChannelPermissions()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleColorsClick = () => {
    setShowColorPanel(true)
  }

  const menuItems: MenuItem[] = [
    {
      icon: BarChart3,
      label: t("menu.dashboard"),
      active: true,
      href: "/panel",
      pageId: "dashboard",
    },
  ]

  const adminTools: MenuItem[] = [
    {
      icon: Users,
      label: t("menu.account"),
      hasSubmenu: false,
      href: "/panel/contas",
      pageId: "account",
    },
    {
      icon: Home,
      label: t("menu.lobby"),
      href: "/",
      pageId: "lobby",
    },
  ]

  const insights: MenuItem[] = [
    {
      icon: MessageSquare,
      label: t("menu.chat"),
      href: "/panel/chat",
      pageId: "chat",
    },
  ]

  const elements: MenuItem[] = [
    {
      icon: Layers,
      label: t("menu.components"),
      hasSubmenu: true,
      href: "/panel/flow",
      pageId: "components",
    },
  ]

  const themes: MenuItem[] = [
    {
      icon: Palette,
      label: t("menu.colors"),
      onClick: handleColorsClick,
      pageId: "colors",
    },
  ]

  // Filtrar itens baseado nas permissões do usuário
  const filterItemsByPermissions = (items: MenuItem[]) => {
    return items.filter((item) => {
      if (!item.pageId) return true // Se não tem pageId, sempre mostra
      return hasPageAccess(item.pageId)
    })
  }

  const filterItems = (items: MenuItem[]) => {
    // Primeiro filtra por permissões, depois por busca
    const permissionFiltered = filterItemsByPermissions(items)

    if (!searchQuery) return permissionFiltered
    return permissionFiltered.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const getCategoryGlowStyle = () => {
    if (!glowEnabled) return {}
    return {
      textShadow: "0 0 8px var(--glow-color), 0 0 15px var(--glow-color-light)",
      letterSpacing: "0.05em",
    }
  }

  const getMenuItemClass = () => {
    const shouldApplyFade = fadeEnabled && fadeMode === "movement"
    return shouldApplyFade ? "fade-text-movement" : ""
  }

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    const filtered = filterItems(items)
    if (filtered.length === 0) return null // Não mostra a categoria se não há itens

    return (
        <div className="mb-6">
          {!sidebarCollapsed && (
              <h3
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-all duration-300 hover:scale-105 transform ${
                      theme === "dark" ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"
                  }`}
                  style={getCategoryGlowStyle()}
              >
                {title}
              </h3>
          )}
          <nav className="space-y-1">
            {filtered.map((item, i) => {
              const content = (
                  <div
                      className={`
              w-full flex items-center ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"} py-2.5 rounded-lg text-left text-sm 
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
                        background: item.active ? "var(--gradient-accent)" : "transparent",
                        boxShadow:
                            item.active && glowEnabled ? `0 0 20px var(--glow-color), 0 0 40px var(--glow-color)` : "none",
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                  >
                    {!item.active && glowEnabled && (
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
                          className="w-4 h-4 transition-all duration-300 transform group-hover:scale-110"
                          style={
                            glowEnabled
                                ? {
                                  filter: item.active
                                      ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))"
                                      : `drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color))`,
                                  textShadow: item.active
                                      ? "0 0 15px rgba(255, 255, 255, 0.8)"
                                      : `0 0 12px var(--glow-color)`,
                                }
                                : {}
                          }
                      />
                      {!sidebarCollapsed && (
                          <span
                              className={`ml-3 transition-all duration-300 ${getMenuItemClass()} ${item.active ? "font-medium" : "group-hover:font-medium"}`}
                              style={
                                glowEnabled
                                    ? {
                                      textShadow: item.active
                                          ? "0 0 10px rgba(255, 255, 255, 0.6)"
                                          : `0 0 8px var(--glow-color)`,
                                      filter: `drop-shadow(0 0 6px var(--glow-color))`,
                                    }
                                    : {}
                              }
                          >
                      {item.label}
                    </span>
                      )}
                    </div>
                    {item.hasSubmenu && !sidebarCollapsed && (
                        <ChevronRight
                            className="w-4 h-4 relative z-10 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-90"
                            style={
                              glowEnabled
                                  ? {
                                    filter: `drop-shadow(0 0 6px var(--glow-color)) drop-shadow(0 0 12px var(--glow-color))`,
                                    textShadow: `0 0 8px var(--glow-color)`,
                                  }
                                  : {}
                            }
                        />
                    )}
                  </div>
              )

              if (item.onClick) {
                return (
                    <button key={i} onClick={item.onClick} className="w-full">
                      {content}
                    </button>
                )
              }

              if (item.href) {
                return (
                    <Link key={i} href={item.href}>
                      {content}
                    </Link>
                )
              }

              return <div key={i}>{content}</div>
            })}
          </nav>
        </div>
    )
  }

  return (
      <div
          className={`${sidebarCollapsed ? "w-16" : "w-64"} flex flex-col h-full border-r panel-scrollbar transition-all duration-300`}
          style={{
            background:
                theme === "dark"
                    ? "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
            borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0",
            boxShadow: glowEnabled ? `0 0 20px var(--glow-color)` : "none",
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
                  boxShadow: glowEnabled ? `0 0 20px var(--glow-color), 0 0 40px var(--glow-color)` : "none",
                }}
            >
            <span
                className="text-white font-bold text-sm transition-all duration-300 group-hover:scale-110"
                style={
                  glowEnabled
                      ? {
                        textShadow: "0 0 15px rgba(255, 255, 255, 1)",
                        filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
                      }
                      : {}
                }
            >
              AU
            </span>
            </div>
            {!sidebarCollapsed && (
                <span
                    className={`font-semibold transition-all duration-300 group-hover:scale-105 ${getMenuItemClass()} ${
                        theme === "dark" ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"
                    }`}
                    style={
                      glowEnabled
                          ? {
                            textShadow: `0 0 15px var(--glow-color)`,
                            filter: `drop-shadow(0 0 10px var(--glow-color))`,
                          }
                          : {}
                    }
                >
              AURA
            </span>
            )}
          </div>
        </div>

        {/* Search / Menu */}
        <div className="flex-1 p-4 overflow-y-auto panel-scrollbar">
          {searchQuery && !sidebarCollapsed && (
              <div className="mb-4">
                <p
                    className={`text-xs ${getMenuItemClass()} ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    style={glowEnabled ? { textShadow: `0 0 8px var(--glow-color)` } : {}}
                >
                  {t("search.resultsFor")} "{searchQuery}"
                </p>
              </div>
          )}

          {renderMenuSection("MENU", menuItems)}
          {renderMenuSection("TOOLS", adminTools)}
          {renderMenuSection("INSIGHTS", insights)}
          {renderMenuSection("ELEMENTS", elements)}
          {renderMenuSection("THEMES", themes)}

          {searchQuery &&
              !sidebarCollapsed &&
              filterItems([...menuItems, ...adminTools, ...insights, ...elements, ...themes]).length === 0 && (
                  <div className="text-center py-8">
                    <p
                        className={`text-sm ${getMenuItemClass()} ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        style={glowEnabled ? { textShadow: `0 0 8px var(--glow-color)` } : {}}
                    >
                      {t("search.noResults")} "{searchQuery}"
                    </p>
                  </div>
              )}
        </div>

        {/* Upgrade Section */}
        {!sidebarCollapsed && (
            <div className="p-4 border-t" style={{ borderColor: theme === "dark" ? "#1a1a1a" : "#e2e8f0" }}>
              <div
                  className="rounded-xl p-4 space-y-3 group cursor-pointer transition-all duration-500 hover:scale-[1.02] relative overflow-hidden"
                  style={{
                    background:
                        theme === "dark"
                            ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                    boxShadow: glowEnabled
                        ? `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px var(--glow-color)`
                        : "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
              >
                {glowEnabled && (
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, var(--glow-color), transparent, var(--glow-color))`,
                          opacity: 0.2,
                        }}
                    />
                )}

                <div className="relative z-10">
                  <h4
                      className={`font-semibold text-sm mb-2 transition-all duration-300 group-hover:scale-105 ${getMenuItemClass()} ${
                          theme === "dark" ? "text-white group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-700"
                      }`}
                      style={
                        glowEnabled
                            ? {
                              textShadow: `0 0 15px var(--glow-color)`,
                              filter: `drop-shadow(0 0 10px var(--glow-color))`,
                            }
                            : {}
                      }
                  >
                    EM DESENVOLVIMENTO!!!!!!!
                  </h4>
                  <p
                      className={`text-xs mb-4 transition-all duration-300 ${getMenuItemClass()} ${
                          theme === "dark"
                              ? "text-gray-400 group-hover:text-gray-300"
                              : "text-gray-600 group-hover:text-gray-700"
                      }`}
                      style={
                        glowEnabled
                            ? {
                              textShadow: `0 0 10px var(--glow-color)`,
                              filter: `drop-shadow(0 0 8px var(--glow-color))`,
                            }
                            : {}
                      }
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
                    {glowEnabled && (
                        <div
                            className="absolute inset-0 opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300 blur-lg scale-110"
                            style={{
                              background: "var(--gradient-accent)",
                            }}
                        />
                    )}
                    <span
                        className="relative z-10 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110"
                        style={
                          glowEnabled
                              ? {
                                textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                                filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))",
                              }
                              : {}
                        }
                    >
                  <span
                      className="mr-2 transition-all duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-125"
                      style={
                        glowEnabled
                            ? {
                              filter: `drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px var(--glow-color))`,
                              textShadow: "0 0 15px rgba(255, 255, 255, 1)",
                            }
                            : {}
                      }
                  >
                    ⬆
                  </span>
                  Upgrade Now
                </span>
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default Sidebar
