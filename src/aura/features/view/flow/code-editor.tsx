"use client"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  value: string
  onChangeAction: (value: string) => void
  language?: string
}

export default function CodeEditor({ value, onChangeAction, language = "javascript" }: CodeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChangeAction(e.target.value)}
      className="font-mono text-sm h-64 whitespace-pre"
      spellCheck={false}
    />
  )
}