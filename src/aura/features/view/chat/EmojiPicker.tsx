"use client"

import { useState } from "react"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  theme: string
}

const emojiCategories = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
  ],
  gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
  ],
  hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "♥️",
    "💌",
    "💤",
    "💢",
    "💬",
    "👁️‍🗨️",
    "🗨️",
    "🗯️",
    "💭",
    "🕳️",
  ],
  objects: [
    "⌚",
    "📱",
    "📲",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
  ],
}

export default function EmojiPicker({ onEmojiSelect, theme }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>("smileys")

  return (
    <div
      className={`rounded-lg border backdrop-blur-sm shadow-lg ${
        theme === "dark" ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"
      }`}
    >
      {/* Category Tabs */}
      <div className={`flex border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? theme === "dark"
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "bg-blue-500 text-white border-b-2 border-blue-300"
                : theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {category === "smileys" && "😊"}
            {category === "gestures" && "👍"}
            {category === "hearts" && "❤️"}
            {category === "objects" && "📱"}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-4">
        <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
          {emojiCategories[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className={`w-8 h-8 text-lg hover:scale-110 transition-transform rounded ${
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
