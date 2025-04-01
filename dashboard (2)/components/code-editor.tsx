"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Download, Play, Bot, Plus, Trash2, FileCode } from "lucide-react"

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  lastEdited: number
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
]

export default function CodeEditor() {
  const [files, setFiles] = useState<CodeFile[]>([])
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null)
  const [fileName, setFileName] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [content, setContent] = useState("")
  const [output, setOutput] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")

  // Load files from localStorage on initial render
  useEffect(() => {
    const savedFiles = localStorage.getItem("dashboard_code_files")
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles)
        setFiles(parsedFiles)
        if (parsedFiles.length > 0) {
          setActiveFile(parsedFiles[0])
          setFileName(parsedFiles[0].name)
          setLanguage(parsedFiles[0].language)
          setContent(parsedFiles[0].content)
        }
      } catch (e) {
        console.error("Failed to parse saved files", e)
      }
    }
  }, [])

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_code_files", JSON.stringify(files))
  }, [files])

  // Update form when active file changes
  useEffect(() => {
    if (activeFile) {
      setFileName(activeFile.name)
      setLanguage(activeFile.language)
      setContent(activeFile.content)
    } else {
      setFileName("")
      setLanguage("javascript")
      setContent("")
    }
  }, [activeFile])

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: "Untitled",
      language: "javascript",
      content: "",
      lastEdited: Date.now(),
    }

    setFiles([newFile, ...files])
    setActiveFile(newFile)
    setFileName(newFile.name)
    setLanguage(newFile.language)
    setContent("")
  }

  const saveFile = () => {
    if (!activeFile) return

    const updatedFile = {
      ...activeFile,
      name: fileName,
      language,
      content,
      lastEdited: Date.now(),
    }

    setFiles(files.map((file) => (file.id === activeFile.id ? updatedFile : file)))

    setActiveFile(updatedFile)
  }

  const deleteFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
    if (activeFile?.id === id) {
      const remainingFiles = files.filter((file) => file.id !== id)
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
    }
  }

  const runCode = () => {
    if (!activeFile) return

    setOutput("")

    try {
      if (language === "javascript") {
        // Create a safe execution environment
        const originalConsoleLog = console.log
        const logs: string[] = []

        // Override console.log to capture output
        console.log = (...args) => {
          logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "))
        }

        try {
          // Execute the code
          const result = new Function(content)()

          // Restore console.log
          console.log = originalConsoleLog

          // Set output
          setOutput(logs.join("\n") + (result !== undefined ? "\n" + String(result) : ""))
        } catch (error) {
          // Restore console.log
          console.log = originalConsoleLog

          // Set error output
          setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
        }
      } else if (language === "html") {
        // Create an iframe to render HTML
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        document.body.appendChild(iframe)

        if (iframe.contentDocument) {
          iframe.contentDocument.open()
          iframe.contentDocument.write(content)
          iframe.contentDocument.close()

          // Get the HTML output
          const html = iframe.contentDocument.documentElement.outerHTML
          setOutput(`HTML Preview Generated\n\n${html}`)

          // Clean up
          document.body.removeChild(iframe)
        }
      } else {
        setOutput(`Running ${language} code is not supported in this environment.`)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const downloadFile = () => {
    if (!activeFile) return

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string): string => {
    switch (lang) {
      case "javascript":
        return "js"
      case "typescript":
        return "ts"
      case "html":
        return "html"
      case "css":
        return "css"
      case "python":
        return "py"
      case "json":
        return "json"
      default:
        return "txt"
    }
  }

  const getAiSuggestion = () => {
    // Simulate AI suggestions
    const suggestions = [
      "Try adding error handling with try/catch blocks.",
      "Consider using arrow functions for cleaner syntax.",
      "You could optimize this loop with Array.map() or Array.filter().",
      "This code could benefit from using async/await for better readability.",
      "Consider adding comments to explain complex logic.",
      "You might want to extract this logic into a separate function.",
      "This variable name could be more descriptive.",
      "Consider using template literals for string concatenation.",
      "This condition could be simplified using the ternary operator.",
      "You could use destructuring to make this code more concise.",
    ]

    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="editor" className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={createNewFile}>
              <Plus className="mr-2 h-4 w-4" />
              New File
            </Button>
            <Button variant="outline" size="sm" onClick={getAiSuggestion}>
              <Bot className="mr-2 h-4 w-4" />
              AI Suggest
            </Button>
          </div>
        </div>

        <TabsContent value="editor" className="h-[calc(100%-48px)]">
          {activeFile ? (
            <div className="flex h-full flex-col">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="File name"
                  className="w-40"
                />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveFile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={runCode}>
                  <Play className="mr-2 h-4 w-4" />
                  Run
                </Button>
                <Button variant="outline" onClick={downloadFile}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              {aiSuggestion && (
                <div className="mb-4 rounded-md bg-muted p-3 text-sm">
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4" />
                    <span className="font-medium">AI Suggestion:</span>
                  </div>
                  <p className="mt-1">{aiSuggestion}</p>
                </div>
              )}

              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`// Write your ${LANGUAGES.find((l) => l.value === language)?.label || "code"} here...`}
                  className="h-full w-full resize-none rounded-md border border-input bg-background p-3 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {activeFile.lastEdited > 0 && (
                <div className="mt-2 text-xs text-gray-500">Last edited: {formatDate(activeFile.lastEdited)}</div>
              )}
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <FileCode className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No files yet. Create a new file to get started!</p>
              <Button variant="outline" className="mt-4" onClick={createNewFile}>
                Create File
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="output" className="h-[calc(100%-48px)]">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Output</h3>
              <Button variant="outline" size="sm" onClick={runCode}>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </Button>
            </div>
            <div className="flex-1 overflow-auto rounded border bg-black p-4 font-mono text-sm text-green-400">
              <pre className="whitespace-pre-wrap">{output || "No output yet. Run your code to see results."}</pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="h-[calc(100%-48px)]">
          {files.length === 0 ? (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <FileCode className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No files yet. Create a new file to get started!</p>
              <Button variant="outline" className="mt-4" onClick={createNewFile}>
                Create File
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                    activeFile?.id === file.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveFile(file)}
                >
                  <CardContent className="p-0">
                    <div className="border-b p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileCode className="mr-2 h-4 w-4" />
                          <h3 className="font-medium">
                            {file.name}.{getFileExtension(file.language)}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFile(file.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="rounded bg-muted px-2 py-1 text-xs">
                          {LANGUAGES.find((l) => l.value === file.language)?.label || file.language}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(file.lastEdited)}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <pre className="line-clamp-3 overflow-hidden text-xs text-gray-600">
                        {file.content || "// Empty file"}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

