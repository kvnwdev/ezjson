"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Moon,
  Sun,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";

// Define JSON primitive and recursive types
type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

// Use a type alias instead of an empty interface for JSONArray to fix ESLint warning.
type JSONArray = JSONValue[];

type JsonNode = {
  key: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  value?: JSONPrimitive;
  children?: JsonNode[];
  arrayLength?: number;
};

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
}`;

const typeColors: { [key: string]: string } = {
  object: "text-blue-600 dark:text-blue-400",
  array: "text-purple-600 dark:text-purple-400",
  string: "text-green-600 dark:text-green-400",
  number: "text-red-600 dark:text-red-400",
  boolean: "text-yellow-600 dark:text-yellow-400",
  null: "text-gray-600 dark:text-gray-400",
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonStructure, setJsonStructure] = useState<JsonNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleVisualize = () => {
    try {
      // Parse the JSON and assert the type as JSONValue for safety.
      const data = JSON.parse(jsonInput) as JSONValue;
      const structure = parseJsonStructure(data);
      setJsonStructure(structure);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Invalid JSON: ${err.message}`);
      } else {
        setError("Invalid JSON: An unknown error occurred");
      }
      setJsonStructure(null);
    }
  };

  const loadSampleJson = () => {
    setJsonInput(sampleJson);
    setError(null);
    setJsonStructure(null);
  };

  // Rewritten parseJsonStructure function using explicit returns
  const parseJsonStructure = (data: JSONValue, key = "root"): JsonNode => {
    if (data === null) {
      return { key, type: "null", value: data };
    }

    if (Array.isArray(data)) {
      return {
        key,
        type: "array",
        arrayLength: data.length,
        children: data.map((item, index) =>
          parseJsonStructure(item, index.toString())
        ),
      };
    }

    if (typeof data === "object") {
      return {
        key,
        type: "object",
        children: Object.entries(data as JSONObject).map(([k, v]) =>
          parseJsonStructure(v, k)
        ),
      };
    }

    // Now data must be a primitive (string, number, or boolean)
    if (typeof data === "string") {
      return { key, type: "string", value: data };
    }

    if (typeof data === "number") {
      return { key, type: "number", value: data };
    }

    if (typeof data === "boolean") {
      return { key, type: "boolean", value: data };
    }

    // Should never reach here if all cases are covered
    throw new Error("Unexpected JSON data type");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow">
        <div className="text-center mb-8">
          <FileJson className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            JSON Structure Visualizer
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Paste your JSON and visualize its structure in a user-friendly
            format.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTitle>Data Privacy Notice</AlertTitle>
          <AlertDescription>
            All data is processed and stored entirely on your device. No
            information is sent to any server.
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
                <Button
                  variant="outline"
                  onClick={loadSampleJson}
                  className="flex-1"
                >
                  Load Sample JSON
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0 h-10 w-10 rounded-lg border-0 bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/90"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
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
        <p className="text-sm text-gray-500">
          Made with passion ❤️ by Kevin Willoughby
        </p>
        <a
          href="https://resume.kvnw.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          More of my work
          <ExternalLink size={14} className="ml-1" />
        </a>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Kevin Willoughby. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function JsonTreeView({ node }: { node: JsonNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const renderValue = () => {
    if (node.type === "array") {
      return `List (${node.arrayLength} items)`;
    }
    if (node.type === "object") {
      return "Object";
    }
    return node.value;
  };

  const getNodeString = () => {
    if (node.type === "object" && node.children) {
      const childrenStr = node.children
        .map((child) => {
          if (child.type === "object" || child.type === "array") {
            return `"${child.key}": ${child.type === "array" ? "[]" : "{}"}`;
          }
          return `"${child.key}": ${JSON.stringify(child.value)}`;
        })
        .join(", ");
      return `"${node.key}": { ${childrenStr} }`;
    }
    if (node.type === "array" && node.children) {
      const childrenStr = node.children
        .map((child) => {
          if (child.type === "object" || child.type === "array") {
            return child.type === "array" ? "[]" : "{}";
          }
          return JSON.stringify(child.value);
        })
        .join(", ");
      return `"${node.key}": [${childrenStr}]`;
    }
    return `"${node.key}": ${JSON.stringify(node.value)}`;
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const value = renderValue();
    if (value !== undefined) {
      navigator.clipboard.writeText(String(value));
      toast.success("Value copied to clipboard!");
    }
  };

  const handleCopyNode = () => {
    navigator.clipboard.writeText(getNodeString());
    toast.success("Node copied to clipboard!");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY - 10 });
  };

  return (
    <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
      <div
        className="flex items-center py-2 min-w-0 group relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={handleMouseMove}
      >
        {(node.type === "object" || node.type === "array") && (
          <button
            onClick={toggleExpand}
            className="mr-2 flex-shrink-0 focus:outline-none"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
        <div
          className="flex items-center flex-1 min-w-0 cursor-pointer hover:opacity-80"
          onClick={handleCopyNode}
        >
          <span className="font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
            {node.key}
          </span>
          <span
            className={`ml-2 text-sm ${typeColors[node.type]} flex-shrink-0`}
          >
            ({node.type})
          </span>
          {node.value !== undefined && (
            <span
              onClick={handleCopyValue}
              className="ml-2 text-sm text-gray-500 dark:text-gray-400 truncate group-hover:truncate-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors relative"
              title={String(renderValue())}
            >
              {renderValue()}
            </span>
          )}
        </div>
        {showTooltip && (
          <div
            className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg pointer-events-none animate-in fade-in duration-200"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            Click to copy
          </div>
        )}
      </div>
      {isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <JsonTreeView key={`${child.key}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
