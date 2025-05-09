"use client"

import { useState } from "react"
import { Globe, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"

export default function LanguageSelector() {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "sw", name: "Kiswahili" },
    { code: "hi", name: "हिन्दी" },
  ]

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
        <Globe className="w-4 h-4" />
        <span>{selectedLanguage.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border border-gray-800">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center justify-between ${
              selectedLanguage.code === language.code ? "text-purple-400" : "text-gray-300"
            } hover:text-white hover:bg-gray-800 cursor-pointer`}
            onClick={() => setSelectedLanguage(language)}
          >
            {language.name}
            {selectedLanguage.code === language.code && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
