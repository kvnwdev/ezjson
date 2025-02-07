"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, ChevronDown, ExternalLink, Moon, Sun, FileJson } from "lucide-react"

type JsonNode = {
  key: string
  type: string
  value?: any
  children?: JsonNode[]
  arrayLength?: number
}

const sampleJson = `{
  "user": {
    "name": "John Doe",
    "age": 28,
    "isStudent": false,
    "grades": [85, 90, 92],
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "zipCode": "12345"
    },
    "hobbies": ["reading", "cycling", "photography"],
    "accountBalance": 1234.56,
    "lastLogin": "2023-05-15T14:30:00Z",
    "profilePicture": null
  }
}`

const typeColors: { [key: string]: string } = {
  object: "text-blue-600 dark:text-blue-400",
  array: "text-purple-600 dark:text-purple-400",
  string: "text-green-600 dark:text-green-400",
  number: "text-red-600 dark:text-red-400",
  boolean: "text-yellow-600 dark:text-yellow-400",
  null: "text-gray-600 dark:text-gray-400",
}

export default function Home() {
  const [jsonInput, setJsonInput] = useState("")
  const [jsonStructure, setJsonStructure] = useState<JsonNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleVisualize = () => {
    try {
      const data = JSON.parse(jsonInput)
      const structure = parseJsonStructure(data)
      setJsonStructure(structure)
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(`Invalid JSON: ${err.message}`)
      } else {
        setError("Invalid JSON: An unknown error occurred")
      }
      setJsonStructure(null)
    }
  }

  const loadSampleJson = () => {
    setJsonInput(sampleJson)
    setError(null)
    setJsonStructure(null)
  }

  const parseJsonStructure = (data: any, key = "root"): JsonNode => {
    const type = Array.isArray(data) ? "array" : typeof data
    const node: JsonNode = { key, type }

    if (data === null) {
      node.type = "null"
      node.value = "null"
    } else if (type === "object") {
      node.children = Object.entries(data).map(([k, v]) => parseJsonStructure(v, k))
    } else if (type === "array") {
      node.arrayLength = data.length
      if (data.length > 0) {
        node.children = data.map((item: any, index: number) => parseJsonStructure(item, index.toString()))
      }
    } else {
      node.value = String(data)
    }

    return node
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow">
        <div className="text-center mb-8">
          <FileJson className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            JSON Structure Visualizer
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Paste your JSON and visualize its structure in a user-friendly format.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTitle>Data Privacy Notice</AlertTitle>
          <AlertDescription>
            All data is processed and stored entirely on your device. No information is sent to any server.
          </AlertDescription>
        </Alert>

        <Card className="mb-6 dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="h-40 mb-4"
            />
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Button onClick={handleVisualize} className="flex-1">
                  Visualize Structure
                </Button>
                <Button variant="outline" onClick={loadSampleJson} className="flex-1">
                  Load Sample JSON
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0 h-10 w-10 rounded-lg border-0 bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/90"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {jsonStructure && (
          <Card className="dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Data Structure</h2>
              <JsonTreeView node={jsonStructure} />
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="mt-12 text-center space-y-2">
        <p className="text-sm text-gray-500">Made with passion ❤️ by Kevin Willoughby</p>
        <a
          href="https://resume.kvnw.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          More of my work
          <ExternalLink size={14} className="ml-1" />
        </a>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Kevin Willoughby. All rights reserved.</p>
      </footer>
    </div>
  )
}

function JsonTreeView({ node }: { node: JsonNode }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const renderValue = () => {
    if (node.type === "array") {
      return `List (${node.arrayLength} items)`
    }
    if (node.type === "object") {
      return "Object"
    }
    return node.value
  }

  return (
    <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
      <div className="flex items-center py-2">
        {(node.type === "object" || node.type === "array") && (
          <button onClick={toggleExpand} className="mr-2 focus:outline-none">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <span className="font-medium text-gray-700 dark:text-gray-300">{node.key}</span>
        <span className={`ml-2 text-sm ${typeColors[node.type]}`}>({node.type})</span>
        {node.value && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{renderValue()}</span>}
      </div>
      {isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <JsonTreeView key={`${child.key}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

