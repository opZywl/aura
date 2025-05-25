"use client"

import React, { useEffect } from "react"
import Sidebar from "./homePanels/Sidebar"
import Header from "./homePanels/Header"
import Content from "./homePanels/Content"
import Stats from "./homePanels/Stats"
import ColorPanel from "./homePanels/ColorPanel"
import SearchPanel from "./homePanels/SearchPanel"
import { useTheme } from "./homePanels/ThemeContext"

const Home: React.FC = () => {
  const { theme, showColorPanel, showSearch } = useTheme()

  useEffect(() => {
    console.log("=== HOME RENDER ===")
    console.log("showColorPanel:", showColorPanel)
    console.log("showSearch:", showSearch)
  }, [showColorPanel, showSearch])

  return (
      <div
          className={`flex h-screen text-white overflow-hidden ${
              theme === "dark"
                  ? "home-bg-dark-primary"
                  : "home-bg-light-primary"
          }`}
      >
        <Sidebar />

        <div
            className={`flex-1 flex flex-col min-h-0 ${
                theme === "dark"
                    ? "home-bg-dark-primary"
                    : "home-bg-light-primary"
            }`}
        >
          <Header />

          <div
              className={`flex-1 flex min-h-0 ${
                  theme === "dark"
                      ? "home-bg-dark-primary"
                      : "home-bg-light-primary"
              }`}
          >
            <Content />
            <Stats />
          </div>
        </div>

        {showColorPanel && <ColorPanel />}
        {showSearch    && <SearchPanel />}
      </div>
  )
}

export default Home