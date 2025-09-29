"use client";

import { useState } from "react";
import JSON5 from "json5";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowRight,
  Clipboard,
  FileJson,
  Rows3,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Define JSON primitive and recursive types
type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

type JSONArray = JSONValue[];

type JsonNode = {
  key: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  value?: JSONPrimitive;
  children?: JsonNode[];
  arrayLength?: number;
};

type FeatureId = "schema" | "formatter" | "jsonl";

type FlexibleSource = "json" | "jsonl" | "json5" | "loose-object";

type FlexibleParseResult = {
  data: unknown;
  source: FlexibleSource;
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

const featureMeta: Record<FeatureId, { label: string; description: string }> = {
  schema: {
    label: "Schema Explorer",
    description:
      "Generate a friendly map of your JSON so you can understand the structure at a glance.",
  },
  formatter: {
    label: "Formatter",
    description:
      "Drop in any flavour of JSON and get back beautifully formatted output ready to share.",
  },
  jsonl: {
    label: "JSONL Builder",
    description:
      "Collapse JSON or JSON lines into compact, single-line JSONL entries for pipelines and logs.",
  },
};

const sourceLabels: Record<FlexibleSource, string> = {
  json: "Standard JSON",
  json5: "JSON5 / JavaScript object literal",
  jsonl: "JSON Lines",
  "loose-object": "Loose object notation",
};

const typeColors: { [key: string]: string } = {
  object: "text-neutral-900",
  array: "text-neutral-700",
  string: "text-emerald-600",
  number: "text-sky-600",
  boolean: "text-amber-600",
  null: "text-neutral-500",
};

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>("schema");

  // Schema explorer state
  const [jsonInput, setJsonInput] = useState("");
  const [jsonStructure, setJsonStructure] = useState<JsonNode | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Formatter state
  const [formatterInput, setFormatterInput] = useState("");
  const [formatterOutput, setFormatterOutput] = useState<string>("");
  const [formatterSource, setFormatterSource] = useState<FlexibleSource | null>(
    null
  );
  const [formatterError, setFormatterError] = useState<string | null>(null);

  // JSONL builder state
  const [jsonlInput, setJsonlInput] = useState("");
  const [jsonlOutput, setJsonlOutput] = useState<string>("");
  const [jsonlSource, setJsonlSource] = useState<FlexibleSource | null>(null);
  const [jsonlError, setJsonlError] = useState<string | null>(null);

  const activeMeta = featureMeta[activeFeature];

  const handleVisualize = () => {
    try {
      const data = JSON.parse(jsonInput) as JSONValue;
      const structure = parseJsonStructure(data);
      setJsonStructure(structure);
      setSchemaError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? `We couldn't parse that JSON. ${err.message}`
          : "We couldn't parse that JSON.";
      setSchemaError(message);
      setJsonStructure(null);
    }
  };

  const handleLoadSample = () => {
    setJsonInput(sampleJson);
    setJsonStructure(null);
    setSchemaError(null);
  };

  const handleFormat = () => {
    try {
      const result = parseFlexibleJson(formatterInput);
      const pretty = JSON.stringify(result.data, null, 2);
      setFormatterOutput(pretty ?? "");
      setFormatterSource(result.source);
      setFormatterError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "We couldn't format that input.";
      setFormatterError(message);
      setFormatterOutput("");
      setFormatterSource(null);
    }
  };

  const handleJsonl = () => {
    try {
      const result = parseFlexibleJson(jsonlInput);
      const lines = toJsonLines(result.data);
      setJsonlOutput(lines.join("\n"));
      setJsonlSource(result.source);
      setJsonlError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't convert that input to JSONL.";
      setJsonlError(message);
      setJsonlOutput("");
      setJsonlSource(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-12 lg:flex-row lg:gap-16 lg:px-12 lg:pt-20">
        <aside className="w-full space-y-10 lg:w-72">
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Kevin Willoughby
            </span>
            <h1 className="text-3xl font-semibold tracking-tight">EasyJSON</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              A minimalist toolkit for making sense of JSON. Explore schemas,
              clean up messy payloads, and prep JSONL for your pipelines — all
              in one focused workspace.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Toolkit
            </p>
            <nav className="space-y-2">
              {(Object.keys(featureMeta) as FeatureId[]).map((feature) => {
                const meta = featureMeta[feature];
                const isActive = activeFeature === feature;
                return (
                  <button
                    key={feature}
                    onClick={() => setActiveFeature(feature)}
                    className={`flex w-full items-start justify-between rounded-lg border border-transparent px-3 py-3 text-left transition ${
                      isActive
                        ? "bg-white shadow-sm"
                        : "hover:border-neutral-300 hover:bg-white/60"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium tracking-tight text-neutral-900">
                        {meta.label}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {meta.description}
                      </p>
                    </div>
                    <ArrowRight
                      className={`mt-1 size-4 transition-transform ${
                        isActive ? "translate-x-0" : "-translate-x-1"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="hidden text-xs leading-relaxed text-neutral-500 lg:block">
            Data never leaves this page. Everything is processed locally in
            your browser.
          </div>
        </aside>

        <main className="flex-1 space-y-10">
          <header className="space-y-6">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
              <span>Minimal JSON studio</span>
              <span className="hidden h-px flex-1 bg-neutral-300 lg:block" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                {activeMeta.label}
              </h2>
              <p className="max-w-2xl text-base text-neutral-600">
                {activeMeta.description}
              </p>
            </div>
          </header>

          <section className="space-y-12">
            {activeFeature === "schema" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
                      <FileJson className="size-5 text-neutral-400" />
                      <span>Paste a JSON payload to explore its structure.</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleLoadSample}
                        className="border-neutral-300"
                      >
                        Load sample
                      </Button>
                      <Button onClick={handleVisualize}>Visualize schema</Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder='{"name": "Ada", "languages": ["python", "go"]}'
                    value={jsonInput}
                    onChange={(event) => setJsonInput(event.target.value)}
                    className="mt-4 h-48 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm"
                  />
                </div>
                {schemaError && (
                  <Alert className="rounded-xl border-amber-200 bg-amber-50">
                    <AlertTitle>Heads up</AlertTitle>
                    <AlertDescription>{schemaError}</AlertDescription>
                  </Alert>
                )}
                {jsonStructure && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                      Structure
                    </h3>
                    <div className="mt-4 text-sm">
                      <JsonTreeView node={jsonStructure} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFeature === "formatter" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
                    <Sparkles className="size-5 text-neutral-400" />
                    <span>
                      Drop any JSON flavour here — we’ll figure it out and tidy
                      it up.
                    </span>
                  </div>
                  <Textarea
                    placeholder="{ item1, item2 }"
                    value={formatterInput}
                    onChange={(event) => setFormatterInput(event.target.value)}
                    className="mt-4 h-48 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={handleFormat}>Format JSON</Button>
                    {formatterOutput && (
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(formatterOutput)}
                        className="border-neutral-300"
                      >
                        <Clipboard className="size-4" /> Copy formatted JSON
                      </Button>
                    )}
                  </div>
                </div>
                {formatterError && (
                  <Alert className="rounded-xl border-amber-200 bg-amber-50">
                    <AlertTitle>Heads up</AlertTitle>
                    <AlertDescription>{formatterError}</AlertDescription>
                  </Alert>
                )}
                {formatterOutput && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                      <span>Formatted output</span>
                      {formatterSource && <span>{sourceLabels[formatterSource]}</span>}
                    </div>
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-950/95 px-4 py-4 text-sm text-neutral-100">{formatterOutput}</pre>
                  </div>
                )}
              </div>
            )}

            {activeFeature === "jsonl" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
                    <Rows3 className="size-5 text-neutral-400" />
                    <span>
                      Convert multi-line JSON or JSONL into compact, single-line
                      entries.
                    </span>
                  </div>
                  <Textarea
                    placeholder='{"name":"Ada"}\n{"name":"Grace"}'
                    value={jsonlInput}
                    onChange={(event) => setJsonlInput(event.target.value)}
                    className="mt-4 h-48 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={handleJsonl}>Build JSONL</Button>
                    {jsonlOutput && (
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(jsonlOutput)}
                        className="border-neutral-300"
                      >
                        <Clipboard className="size-4" /> Copy JSONL
                      </Button>
                    )}
                  </div>
                </div>
                {jsonlError && (
                  <Alert className="rounded-xl border-amber-200 bg-amber-50">
                    <AlertTitle>Heads up</AlertTitle>
                    <AlertDescription>{jsonlError}</AlertDescription>
                  </Alert>
                )}
                {jsonlOutput && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                      <span>JSONL output</span>
                      {jsonlSource && <span>{sourceLabels[jsonlSource]}</span>}
                    </div>
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-950/95 px-4 py-4 text-sm text-neutral-100">{jsonlOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function handleCopy(value: string) {
  navigator.clipboard.writeText(value);
  toast.success("Copied to clipboard");
}

function parseJsonStructure(data: JSONValue, key = "root"): JsonNode {
  if (data === null) {
    return { key, type: "null", value: data };
  }

  if (Array.isArray(data)) {
    return {
      key,
      type: "array",
      arrayLength: data.length,
      children: data.map((item, index) => parseJsonStructure(item, index.toString())),
    };
  }

  if (typeof data === "object") {
    return {
      key,
      type: "object",
      children: Object.entries(data as JSONObject).map(([childKey, value]) =>
        parseJsonStructure(value, childKey)
      ),
    };
  }

  if (typeof data === "string") {
    return { key, type: "string", value: data };
  }

  if (typeof data === "number") {
    return { key, type: "number", value: data };
  }

  if (typeof data === "boolean") {
    return { key, type: "boolean", value: data };
  }

  throw new Error("Unexpected JSON data type");
}

function JsonTreeView({ node }: { node: JsonNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getNodePreview = () => {
    if (node.type === "object" && node.children) {
      const summary = node.children
        .slice(0, 3)
        .map((child) => child.key)
        .join(", ");
      return `{ ${summary}${node.children.length > 3 ? ", …" : ""} }`;
    }
    if (node.type === "array") {
      return `[…]`;
    }
    return JSON.stringify(node.value);
  };

  const handleCopyNode = () => {
    const value = getNodeString(node);
    navigator.clipboard.writeText(value);
    toast.success("Node copied to clipboard");
  };

  return (
    <div className="ml-3 border-l border-neutral-200 pl-4">
      <div className="flex items-start gap-2 py-2">
        {(node.type === "object" || node.type === "array") && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-neutral-400 transition hover:text-neutral-700"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <button
          onClick={handleCopyNode}
          className="flex flex-1 items-baseline justify-between rounded-lg px-3 py-2 text-left transition hover:bg-neutral-100"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-800">
              {node.key}
            </span>
            <span className="text-xs text-neutral-500">{getNodePreview()}</span>
          </div>
          <span className={`text-xs font-semibold uppercase ${typeColors[node.type]}`}>
            {node.type}
          </span>
        </button>
      </div>
      {isExpanded && node.children && (
        <div className="ml-2">
          {node.children.map((child, index) => (
            <JsonTreeView key={`${child.key}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function getNodeString(node: JsonNode): string {
  if (node.type === "object" && node.children) {
    const childEntries = node.children
      .map((child) => `${JSON.stringify(child.key)}: ${getNodeString(child)}`)
      .join(", ");
    return `{ ${childEntries} }`;
  }

  if (node.type === "array" && node.children) {
    const childValues = node.children
      .map((child) => getNodeString(child))
      .join(", ");
    return `[${childValues}]`;
  }

  return JSON.stringify(node.value);
}

function parseFlexibleJson(input: string): FlexibleParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Add some JSON to get started.");
  }

  try {
    return { data: JSON.parse(trimmed), source: "json" };
  } catch (jsonError) {
    const baseError =
      jsonError instanceof Error ? jsonError.message : "Unknown parsing error.";

    const lines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length > 1) {
      const parsedLines: unknown[] = [];
      let valid = true;

      for (const line of lines) {
        try {
          parsedLines.push(JSON.parse(line));
          continue;
        } catch {
          try {
            parsedLines.push(JSON5.parse(line));
            continue;
          } catch {
            const loose = parseLooseObjectLiteral(line);
            if (loose.success) {
              parsedLines.push(loose.data);
              continue;
            }
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        return { data: parsedLines, source: "jsonl" };
      }
    }

    try {
      return { data: JSON5.parse(trimmed), source: "json5" };
    } catch (json5Error) {
      const loose = parseLooseObjectLiteral(trimmed);
      if (loose.success) {
        return { data: loose.data, source: "loose-object" };
      }

      const detail =
        json5Error instanceof Error ? json5Error.message : baseError;
      throw new Error(`We couldn't understand the input. ${detail}`);
    }
  }
}

type LooseObjectResult = { success: true; data: Record<string, unknown> } | { success: false };

function parseLooseObjectLiteral(input: string): LooseObjectResult {
  const trimmed = input.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return { success: false };
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) {
    return { success: true, data: {} };
  }

  const segments = splitTopLevel(inner);
  const result: Record<string, unknown> = {};

  for (const segment of segments) {
    if (!segment) continue;
    const colonIndex = segment.indexOf(":");

    if (colonIndex === -1) {
      const key = sanitiseKey(segment);
      if (!key) {
        return { success: false };
      }
      result[key] = null;
      continue;
    }

    const rawKey = segment.slice(0, colonIndex);
    const key = sanitiseKey(rawKey);
    if (!key) {
      return { success: false };
    }

    const rawValue = segment.slice(colonIndex + 1).trim();
    if (!rawValue) {
      result[key] = null;
      continue;
    }

    const cleanedValue = rawValue.replace(/,$/, "");

    try {
      result[key] = JSON.parse(cleanedValue);
      continue;
    } catch {}

    try {
      result[key] = JSON5.parse(cleanedValue);
      continue;
    } catch {}

    if (!Number.isNaN(Number(cleanedValue))) {
      result[key] = Number(cleanedValue);
      continue;
    }

    result[key] = cleanedValue.replace(/^['"`]/, "").replace(/['"`]$/, "");
  }

  return { success: true, data: result };
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  let inString = false;
  let stringChar: string | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const prevChar = i > 0 ? input[i - 1] : null;

    if (inString) {
      current += char;
      if (char === stringChar && prevChar !== "\\") {
        inString = false;
        stringChar = null;
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (char === "{" || char === "[" || char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === "}" || char === "]" || char === ")") {
      depth = Math.max(depth - 1, 0);
      current += char;
      continue;
    }

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  const finalPart = current.trim();
  if (finalPart) {
    parts.push(finalPart);
  }

  return parts;
}

function sanitiseKey(rawKey: string): string | null {
  const cleaned = rawKey.trim().replace(/^['"`]/, "").replace(/['"`]$/, "");
  if (!cleaned) {
    return null;
  }
  return cleaned;
}

function toJsonLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const stringified = JSON.stringify(item);
      if (typeof stringified !== "string") {
        throw new Error(`Item at index ${index} cannot be represented as JSON.`);
      }
      return stringified;
    });
  }

  if (value && typeof value === "object") {
    const stringified = JSON.stringify(value);
    if (!stringified) {
      throw new Error("Unable to represent the provided object as JSON.");
    }
    return [stringified];
  }

  return [JSON.stringify(value)];
}
