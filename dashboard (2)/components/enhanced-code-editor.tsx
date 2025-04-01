"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, Download, Play, Bot, Plus, Trash2, FileCode, AlertTriangle, Check, Wand2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

// Common coding errors to check for
const CODE_ERRORS = {
  javascript: [
    {
      pattern: /console\.log$$[^)]*$$;?(?!\s*\/\/)/g,
      message: "Don't forget to remove console.log statements in production code",
    },
    {
      pattern: /if\s*$$[^)]*$$\s*\{[^}]*\}\s*else\s*\{[^}]*\}/g,
      check: (code: string) =>
        code.includes("if") &&
        !code.includes("else if") &&
        code.includes("else") &&
        code.match(/if\s*$$[^)]*$$/g)?.length === 1 &&
        code.match(/else\s*\{/g)?.length === 1,
      message: "Consider using a ternary operator for simple if/else statements",
    },
    { pattern: /var\s+/g, message: "Consider using 'let' or 'const' instead of 'var'" },
    { pattern: /==[^=]/g, message: "Consider using '===' for strict equality comparison" },
    {
      pattern: /for\s*$$[^)]*$$/g,
      check: (code: string) =>
        code.includes("for (") &&
        !code.includes("forEach") &&
        !code.includes("map(") &&
        code.match(/for\s*$$[^)]*$$/g)?.length === 1,
      message: "Consider using array methods like forEach, map, filter instead of for loops",
    },
  ],
  typescript: [
    { pattern: /any/g, message: "Avoid using 'any' type when possible" },
    {
      pattern: /console\.log$$[^)]*$$;?(?!\s*\/\/)/g,
      message: "Don't forget to remove console.log statements in production code",
    },
    { pattern: /==[^=]/g, message: "Consider using '===' for strict equality comparison" },
  ],
  html: [
    { pattern: /<img[^>]*(?!alt=)[^>]*>/g, message: "Images should have alt attributes for accessibility" },
    {
      pattern: /<div[^>]*>/g,
      check: (code: string) =>
        code.includes("<div") && !code.includes("<section") && !code.includes("<article") && !code.includes("<main"),
      message: "Consider using semantic HTML elements instead of generic divs",
    },
  ],
  css: [
    { pattern: /!important/g, message: "Avoid using !important as it breaks the natural cascading of CSS" },
    {
      pattern: /px/g,
      check: (code: string) => code.includes("px") && !code.includes("rem") && !code.includes("em"),
      message: "Consider using relative units like rem or em instead of px for better accessibility",
    },
  ],
}

// Code suggestions based on language
const CODE_SUGGESTIONS = {
  javascript: [
    "Use arrow functions for cleaner syntax: `const add = (a, b) => a + b;`",
    "Use template literals for string interpolation: `Hello, ${name}!`",
    "Use destructuring for cleaner object access: `const { name, age } = person;`",
    "Use the spread operator for array/object operations: `const newArray = [...oldArray, newItem];`",
    "Use optional chaining for safer property access: `const value = obj?.prop?.subProp;`",
    "Use async/await for cleaner asynchronous code instead of promise chains",
    "Use map, filter, and reduce for array operations instead of loops",
  ],
  typescript: [
    "Define explicit return types for functions: `function add(a: number, b: number): number { ... }`",
    "Use interfaces for object shapes: `interface User { name: string; age: number; }`",
    "Use type guards to narrow types: `if (typeof value === 'string') { ... }`",
    "Use generics for reusable components: `function identity<T>(arg: T): T { return arg; }`",
    "Use union types for variables that can be multiple types: `type Result = Success | Error;`",
  ],
  html: [
    "Use semantic HTML elements like <article>, <section>, <nav> instead of generic <div>",
    "Include proper ARIA attributes for accessibility",
    "Use <button> for clickable elements instead of styled <div>",
    "Structure your document with <header>, <main>, <footer>",
    "Use <figure> and <figcaption> for images with captions",
  ],
  css: [
    "Use CSS variables for consistent theming: `--primary-color: #3490dc;`",
    "Use flexbox or grid for layouts instead of floats",
    "Use media queries for responsive design",
    "Use rem units for font sizes for better accessibility",
    "Group related styles with CSS custom properties",
  ],
}

// Code templates for quick insertion
const CODE_TEMPLATES = {
  javascript: {
    "React Component": `import React from 'react';

function MyComponent({ prop1, prop2 }) {
  const [state, setState] = React.useState(initialState);
  
  React.useEffect(() => {
    // Side effect code here
    return () => {
      // Cleanup code here
    };
  }, []);
  
  const handleClick = () => {
    setState(newState);
  };
  
  return (
    <div>
      <h1>{prop1}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

export default MyComponent;`,
    "API Fetch": `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}`,
    "Event Handler": `function handleEvent(event) {
  event.preventDefault();
  const { name, value } = event.target;
  
  // Process the event
  console.log(\`Field \${name} changed to \${value}\`);
  
  // Update state or perform other actions
}`,
  },
  typescript: {
    "TypeScript Interface": `interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional property
  readonly createdAt: Date; // Read-only property
}

// Usage
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date()
};`,
    "Generic Function": `function identity<T>(arg: T): T {
  return arg;
}

// Usage
const output = identity<string>('myString');
const value = identity(123); // Type inference works too`,
    "React Component with TypeScript": `import React, { useState, useEffect } from 'react';

interface Props {
  name: string;
  count: number;
  onIncrement: () => void;
}

const Counter: React.FC<Props> = ({ name, count, onIncrement }) => {
  const [localCount, setLocalCount] = useState<number>(count);
  
  useEffect(() => {
    document.title = \`\${name}: \${localCount}\`;
  }, [name, localCount]);
  
  const handleClick = () => {
    setLocalCount(prev => prev + 1);
    onIncrement();
  };
  
  return (
    <div>
      <h1>{name}'s Counter: {localCount}</h1>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};

export default Counter;`,
  },
  html: {
    "Basic HTML Template": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section>
      <h2>Welcome</h2>
      <p>This is my website.</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2023 My Website. All rights reserved.</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`,
    "Form Template": `<form action="/submit" method="post">
  <div class="form-group">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="4" required></textarea>
  </div>
  
  <button type="submit">Submit</button>
</form>`,
    "Responsive Image Gallery": `<div class="gallery">
  <figure>
    <img src="image1.jpg" alt="Description of image 1">
    <figcaption>Image 1</figcaption>
  </figure>
  
  <figure>
    <img src="image2.jpg" alt="Description of image 2">
    <figcaption>Image 2</figcaption>
  </figure>
  
  <figure>
    <img src="image3.jpg" alt="Description of image 3">
    <figcaption>Image 3</figcaption>
  </figure>
</div>

<!-- CSS for this gallery:
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

figure {
  margin: 0;
  overflow: hidden;
  border-radius: 0.5rem;
}

img {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}

figcaption {
  padding: 0.5rem;
  text-align: center;
  background-color: #f8f9fa;
}
-->`,
  },
  css: {
    "Flexbox Layout": `.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item {
  flex: 1 1 300px;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .item {
    flex: 1 1 100%;
  }
}`,
    "CSS Grid Layout": `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 1rem;
}

.grid-item {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}`,
    "CSS Variables": `:root {
  --primary-color: #3490dc;
  --secondary-color: #ffed4a;
  --danger-color: #e3342f;
  --success-color: #38c172;
  --text-color: #333333;
  --background-color: #ffffff;
  --spacing-unit: 1rem;
  --border-radius: 0.25rem;
}

.button {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
}

.button.danger {
  background-color: var(--danger-color);
}

.button.success {
  background-color: var(--success-color);
}`,
  },
}

export default function EnhancedCodeEditor() {
  const [files, setFiles] = useState<CodeFile[]>([])
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null)
  const [fileName, setFileName] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [content, setContent] = useState("")
  const [output, setOutput] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [aiWritingMode, setAiWritingMode] = useState(false)
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

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
      checkCodeForErrors(activeFile.content, activeFile.language)
    } else {
      setFileName("")
      setLanguage("javascript")
      setContent("")
      setErrors([])
    }
  }, [activeFile])

  // Check code for errors when content changes
  useEffect(() => {
    if (activeFile) {
      checkCodeForErrors(content, language)
    }
  }, [content, language])

  // AI writing mode effect
  useEffect(() => {
    if (aiWritingMode && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [aiWritingMode])

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
    setErrors([])
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

  const checkCodeForErrors = (code: string, lang: string) => {
    const newErrors: string[] = []

    // Get the error patterns for the current language
    const errorPatterns = CODE_ERRORS[lang as keyof typeof CODE_ERRORS] || []

    // Check each pattern
    errorPatterns.forEach((error) => {
      if (error.check) {
        // Use custom check function if provided
        if (error.check(code)) {
          newErrors.push(error.message)
        }
      } else if (error.pattern) {
        // Use regex pattern
        if (error.pattern.test(code)) {
          newErrors.push(error.message)
        }
      }
    })

    setErrors(newErrors)
  }

  const getAiSuggestion = () => {
    // Get suggestions for the current language
    const suggestions = CODE_SUGGESTIONS[language as keyof typeof CODE_SUGGESTIONS] || []

    if (suggestions.length > 0) {
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
    } else {
      setAiSuggestion("I don't have specific suggestions for this language yet.")
    }
  }

  const handleAiWritingModeToggle = (checked: boolean) => {
    setAiWritingMode(checked)
    if (checked) {
      getAiSuggestion()
    } else {
      setAiSuggestion("")
    }
  }

  const generateCodeFromPrompt = () => {
    if (!naturalLanguagePrompt.trim()) return

    setIsGeneratingCode(true)

    // Simulate AI code generation
    setTimeout(() => {
      let generatedCode = ""

      // Simple pattern matching for demo purposes
      if (naturalLanguagePrompt.includes("button")) {
        if (language === "html") {
          generatedCode = '<button class="btn btn-primary">Click Me</button>'
        } else if (language === "javascript" || language === "typescript") {
          generatedCode =
            'function handleClick() {\n  console.log("Button clicked!");\n}\n\nconst button = document.createElement("button");\nbutton.textContent = "Click Me";\nbutton.addEventListener("click", handleClick);\ndocument.body.appendChild(button);'
        } else if (language === "css") {
          generatedCode =
            ".btn {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 0.25rem;\n  cursor: pointer;\n}\n\n.btn-primary {\n  background-color: #3490dc;\n  color: white;\n}\n\n.btn-primary:hover {\n  background-color: #2779bd;\n}"
        }
      } else if (naturalLanguagePrompt.includes("form")) {
        if (language === "html") {
          generatedCode =
            '<form>\n  <div class="form-group">\n    <label for="name">Name:</label>\n    <input type="text" id="name" name="name">\n  </div>\n  <div class="form-group">\n    <label for="email">Email:</label>\n    <input type="email" id="email" name="email">\n  </div>\n  <button type="submit">Submit</button>\n</form>'
        }
      } else if (
        naturalLanguagePrompt.includes("red") &&
        naturalLanguagePrompt.includes("button") &&
        naturalLanguagePrompt.includes("click")
      ) {
        if (language === "html") {
          generatedCode =
            '<button id="colorButton" class="normal-button">Click Me</button>\n\n<script>\n  document.getElementById("colorButton").addEventListener("click", function() {\n    this.classList.toggle("red-button");\n  });\n</script>\n\n<style>\n  .normal-button {\n    padding: 10px 20px;\n    background-color: #3490dc;\n    color: white;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n  }\n  \n  .red-button {\n    background-color: #e3342f;\n  }\n</style>'
        } else if (language === "javascript") {
          generatedCode =
            'const button = document.getElementById("colorButton");\n\nbutton.addEventListener("click", function() {\n  if (this.style.backgroundColor === "red") {\n    this.style.backgroundColor = "";\n  } else {\n    this.style.backgroundColor = "red";\n  }\n});'
        } else if (language === "css") {
          generatedCode =
            ".button {\n  padding: 10px 20px;\n  background-color: #3490dc;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n}\n\n.button:hover {\n  background-color: #2779bd;\n}\n\n.button.red {\n  background-color: #e3342f;\n}"
        }
      } else {
        // Default generated code based on language
        switch (language) {
          case "javascript":
            generatedCode =
              '// Generated JavaScript code\nfunction processData(data) {\n  return data.map(item => {\n    return {\n      ...item,\n      processed: true,\n      timestamp: new Date().toISOString()\n    };\n  });\n}\n\n// Example usage\nconst data = [\n  { id: 1, name: "Item 1" },\n  { id: 2, name: "Item 2" }\n];\n\nconst result = processData(data);\nconsole.log(result);'
            break
          case "html":
            generatedCode =
              '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Page</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      line-height: 1.6;\n      margin: 0;\n      padding: 20px;\n    }\n    .container {\n      max-width: 800px;\n      margin: 0 auto;\n    }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Generated HTML</h1>\n    <p>This is a sample HTML page generated from your prompt.</p>\n  </div>\n</body>\n</html>'
            break
          case "css":
            generatedCode =
              "/* Generated CSS */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\n.card {\n  border-radius: 0.5rem;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n  padding: 1.5rem;\n  margin-bottom: 1rem;\n  background-color: white;\n}\n\n.button {\n  display: inline-block;\n  padding: 0.5rem 1rem;\n  background-color: #3490dc;\n  color: white;\n  border-radius: 0.25rem;\n  text-decoration: none;\n  transition: background-color 0.3s ease;\n}\n\n.button:hover {\n  background-color: #2779bd;\n}"
            break
          default:
            generatedCode = `// Generated code for ${language}\n// This is a placeholder for demonstration purposes`
        }
      }

      // Insert the generated code at cursor position or append to the end
      if (textareaRef.current) {
        const cursorPos = textareaRef.current.selectionStart
        const textBefore = content.substring(0, cursorPos)
        const textAfter = content.substring(cursorPos)

        setContent(textBefore + generatedCode + textAfter)
      } else {
        setContent(content + "\n\n" + generatedCode)
      }

      setNaturalLanguagePrompt("")
      setIsGeneratingCode(false)
    }, 1500)
  }

  const insertTemplate = () => {
    if (!selectedTemplate || !activeFile) return

    const templates = CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES]
    if (!templates) return

    const template = templates[selectedTemplate as keyof typeof templates]
    if (!template) return

    // Insert the template at cursor position or append to the end
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart
      const textBefore = content.substring(0, cursorPos)
      const textAfter = content.substring(cursorPos)

      setContent(textBefore + template + textAfter)
    } else {
      setContent(content + "\n\n" + template)
    }

    setSelectedTemplate("")
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
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={createNewFile}>
              <Plus className="mr-2 h-4 w-4" />
              New File
            </Button>
            <div className="flex items-center space-x-2">
              <Switch id="ai-mode" checked={aiWritingMode} onCheckedChange={handleAiWritingModeToggle} />
              <Label htmlFor="ai-mode" className="text-xs">
                AI Mode
              </Label>
            </div>
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

              {errors.length > 0 && (
                <div className="mb-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">Code suggestions:</div>
                      <ul className="mt-2 list-disc pl-5">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {aiWritingMode && (
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <Textarea
                      value={naturalLanguagePrompt}
                      onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                      placeholder="Describe what code you want to generate..."
                      className="min-h-[60px] flex-1 resize-none"
                    />
                    <Button
                      onClick={generateCodeFromPrompt}
                      disabled={isGeneratingCode || !naturalLanguagePrompt.trim()}
                      className="self-end"
                    >
                      {isGeneratingCode ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Generate
                    </Button>
                  </div>

                  {aiSuggestion && (
                    <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                      <div className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        <span className="font-medium">AI Suggestion:</span>
                      </div>
                      <p className="mt-1">{aiSuggestion}</p>
                    </div>
                  )}

                  <div className="mt-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Insert code template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES] || {}).map((template) => (
                          <SelectItem key={template} value={template}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <Button variant="outline" size="sm" onClick={insertTemplate} className="mt-2">
                        Insert Template
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1">
                <textarea
                  ref={textareaRef}
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

        <TabsContent value="ai" className="h-[calc(100%-48px)]">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-medium">Code Generation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Describe what you want to create</label>
                    <Textarea
                      value={naturalLanguagePrompt}
                      onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                      placeholder="E.g., Create a button that turns red when clicked"
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={generateCodeFromPrompt}
                    disabled={isGeneratingCode || !naturalLanguagePrompt.trim()}
                    className="w-full"
                  >
                    {isGeneratingCode ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Code
                  </Button>
                  <p className="text-xs text-gray-500">
                    The AI will generate code based on your description and insert it into the active file.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-medium">Code Templates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Select a template to insert</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES] || {}).map((template) => (
                          <SelectItem key={template} value={template}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={insertTemplate} disabled={!selectedTemplate || !activeFile} className="w-full">
                    Insert Template
                  </Button>
                  <div className="rounded-md bg-muted p-3">
                    <h4 className="mb-2 font-medium">
                      Available Templates for {LANGUAGES.find((l) => l.value === language)?.label || language}
                    </h4>
                    <ul className="list-disc pl-5 text-sm">
                      {Object.keys(CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES] || {}).map((template) => (
                        <li key={template}>{template}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-medium">Code Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Automatic error detection and suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Real-time code quality feedback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Language-specific best practices</span>
                  </div>

                  <div className="rounded-md bg-muted p-3">
                    <h4 className="mb-2 font-medium">Current Analysis</h4>
                    {errors.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No issues detected in your current code.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

