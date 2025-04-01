"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Globe,
  Bookmark,
  X,
  Mic,
  Camera,
  MapPin,
  Wand2,
  Loader2,
  Smartphone,
  Laptop,
  LayoutGrid,
  Bell,
  Code,
  FileCode,
} from "lucide-react"

export default function WebBrowser() {
  const [url, setUrl] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<{ name: string; url: string }[]>([])
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false,
    location: false,
    notifications: false,
  })
  const [permissionRequests, setPermissionRequests] = useState<{ type: string; granted: boolean | null }[]>([])
  const [showAiDesigner, setShowAiDesigner] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false)
  const [designHistory, setDesignHistory] = useState<string[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // New state for AI website editor
  const [editedHtml, setEditedHtml] = useState("")
  const [editedCss, setEditedCss] = useState("")
  const [editedJs, setEditedJs] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState<"visual" | "code">("visual")
  const [previewHtml, setPreviewHtml] = useState("")

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("dashboard_bookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (e) {
        console.error("Failed to parse saved bookmarks", e)
      }
    }

    const savedPermissions = localStorage.getItem("dashboard_browser_permissions")
    if (savedPermissions) {
      try {
        setDevicePermissions(JSON.parse(savedPermissions))
      } catch (e) {
        console.error("Failed to parse saved permissions", e)
      }
    }
  }, [])

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_bookmarks", JSON.stringify(bookmarks))
  }, [bookmarks])

  // Save permissions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_browser_permissions", JSON.stringify(devicePermissions))
  }, [devicePermissions])

  const addBookmark = () => {
    if (!currentUrl) return

    // Extract domain for name if not provided
    let name = url
    try {
      const urlObj = new URL(currentUrl)
      name = urlObj.hostname.replace("www.", "")
    } catch (e) {
      // Use the URL as is if parsing fails
    }

    // Check if bookmark already exists
    if (bookmarks.some((b) => b.url === currentUrl)) {
      setError("This URL is already bookmarked")
      return
    }

    setBookmarks([...bookmarks, { name, url: currentUrl }])
  }

  const removeBookmark = (url: string) => {
    setBookmarks(bookmarks.filter((b) => b.url !== url))
  }

  const navigateToBookmark = (url: string) => {
    navigateTo(url)
  }

  const navigateTo = (targetUrl: string) => {
    if (!targetUrl) return

    try {
      // Validate and format URL
      let formattedUrl = targetUrl.trim()
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl
      }

      // Basic URL validation
      new URL(formattedUrl)

      // Add to history if it's a new URL
      if (currentUrl && currentUrl !== formattedUrl) {
        const newHistory = [...history.slice(0, historyIndex + 1), currentUrl]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }

      setUrl(formattedUrl)
      setCurrentUrl(formattedUrl)
      setError(null)

      // Reset edited content
      setEditedHtml("")
      setEditedCss("")
      setEditedJs("")
      setIsEditing(false)
    } catch (err) {
      setError("Please enter a valid URL")
    }
  }

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    navigateTo(url)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const previousUrl = history[newIndex]
      setUrl(previousUrl)
      setCurrentUrl(previousUrl)
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextUrl = history[newIndex]
      setUrl(nextUrl)
      setCurrentUrl(nextUrl)
    }
  }

  const refresh = () => {
    if (currentUrl) {
      // Force iframe refresh by temporarily changing the src
      if (iframeRef.current) {
        iframeRef.current.src = "about:blank"
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentUrl
          }
        }, 100)
      }
    }
  }

  const requestPermission = (type: keyof typeof devicePermissions) => {
    // Add a new permission request
    setPermissionRequests([
      ...permissionRequests,
      {
        type,
        granted: null,
      },
    ])
  }

  const handlePermissionResponse = (index: number, granted: boolean) => {
    const updatedRequests = [...permissionRequests]
    updatedRequests[index].granted = granted
    setPermissionRequests(updatedRequests)

    // If granted, update the device permissions
    if (granted) {
      const permType = updatedRequests[index].type as keyof typeof devicePermissions
      setDevicePermissions({
        ...devicePermissions,
        [permType]: true,
      })
    }

    // Remove the request after a delay
    setTimeout(() => {
      setPermissionRequests(permissionRequests.filter((_, i) => i !== index))
    }, 3000)
  }

  // Function to simulate website code inspection
  const inspectWebsite = () => {
    if (!currentUrl) return

    setIsEditing(true)

    // Simulate fetching website code
    setTimeout(() => {
      // Generate sample HTML, CSS, and JS based on the current URL
      const domain = new URL(currentUrl).hostname

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain}</title>
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" defer></script>
</head>
<body>
  <header>
    <nav>
      <div class="logo">${domain}</div>
      <ul class="menu">
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Welcome to ${domain}</h1>
      <p>This is a simulated website for demonstration purposes.</p>
      <button class="cta-button">Learn More</button>
    </section>
    
    <section class="features">
      <div class="feature">
        <h2>Feature 1</h2>
        <p>Description of feature 1</p>
      </div>
      <div class="feature">
        <h2>Feature 2</h2>
        <p>Description of feature 2</p>
      </div>
      <div class="feature">
        <h2>Feature 3</h2>
        <p>Description of feature 3</p>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2023 ${domain}. All rights reserved.</p>
  </footer>
</body>
</html>`

      const css = `/* Reset styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Header styles */
header {
  background-color: #f8f9fa;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.menu {
  display: flex;
  list-style: none;
}

.menu li {
  margin-left: 1.5rem;
}

.menu a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

/* Hero section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #e9ecef;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #6c757d;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

/* Features section */
.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.feature {
  flex: 0 1 30%;
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.feature h2 {
  margin-bottom: 1rem;
  color: #343a40;
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  background-color: #343a40;
  color: white;
}`

      const js = `// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document loaded');

  // Get elements
  const ctaButton = document.querySelector('.cta-button');
  const features = document.querySelectorAll('.feature');

  // Add event listeners
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      alert('Thanks for your interest! This is a simulated button click.');
    });
  }

  // Add hover effects to features
  features.forEach(feature => {
    feature.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    feature.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Simulate analytics
  console.log('Page viewed: ' + window.location.href);
});`

      setEditedHtml(html)
      setEditedCss(css)
      setEditedJs(js)

      // Create preview HTML
      updatePreview(html, css, js)
    }, 1000)
  }

  // Function to update the preview with the current HTML, CSS, and JS
  const updatePreview = (html: string, css: string, js: string) => {
    // Create a complete HTML document with inline CSS and JS
    const fullHtml = html
      .replace("</head>", `<style>${css}</style></head>`)
      .replace("</body>", `<script>${js}</script></body>`)

    setPreviewHtml(fullHtml)
  }

  // Function to apply changes to the preview
  const applyChanges = () => {
    updatePreview(editedHtml, editedCss, editedJs)
  }

  const generateDesign = async () => {
    if (!aiPrompt.trim()) return

    setIsGeneratingDesign(true)

    try {
      // Use the provided API key for Gemini (note: this is a simulated implementation)
      const apiKey = "f41ba4e0cb1adf58d7fef7e8b4995ab9"

      // In a real implementation, we would make an API call to Gemini
      // For this demo, we'll simulate the AI response

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Process the prompt to determine what changes to make
      const prompt = aiPrompt.toLowerCase()

      // Make a copy of the current code
      const newHtml = editedHtml
      let newCss = editedCss
      const newJs = editedJs

      // Apply changes based on the prompt
      if (prompt.includes("blue") || prompt.includes("color")) {
        // Change color scheme to blue
        newCss = newCss.replace(/background-color: #007bff;/g, "background-color: #0056b3;")
        newCss = newCss.replace(/background-color: #e9ecef;/g, "background-color: #e6f2ff;")
        newCss = newCss.replace(/color: #333;/g, "color: #0056b3;")
      }

      if (prompt.includes("larger") || prompt.includes("bigger") || prompt.includes("font")) {
        // Increase font sizes
        newCss = newCss.replace(/font-size: 1.5rem;/g, "font-size: 2rem;")
        newCss = newCss.replace(/font-size: 2.5rem;/g, "font-size: 3.5rem;")
        newCss = newCss.replace(/font-size: 1.2rem;/g, "font-size: 1.5rem;")
      }

      if (prompt.includes("layout") || prompt.includes("grid") || prompt.includes("column")) {
        // Change layout to grid
        newCss = newCss.replace(/display: flex;/g, "display: grid;")
        newCss = newCss.replace(/flex-wrap: wrap;/g, "grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));")
      }

      if (prompt.includes("animation") || prompt.includes("animate")) {
        // Add animation to buttons
        newCss += `
/* Added animations */
.cta-button {
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}`
      }

      if (prompt.includes("dark") || prompt.includes("theme")) {
        // Change to dark theme
        newCss = newCss.replace(/background-color: #f8f9fa;/g, "background-color: #222;")
        newCss = newCss.replace(/background-color: #e9ecef;/g, "background-color: #333;")
        newCss = newCss.replace(/color: #333;/g, "color: #fff;")
        newCss = newCss.replace(/color: #6c757d;/g, "color: #ccc;")
        newCss = newCss.replace(/background-color: #343a40;/g, "background-color: #111;")
      }

      // Update the edited code
      setEditedHtml(newHtml)
      setEditedCss(newCss)
      setEditedJs(newJs)

      // Update the preview
      updatePreview(newHtml, newCss, newJs)

      // Store the prompt in history
      setDesignHistory([...designHistory, aiPrompt])

      // Reset the prompt
      setAiPrompt("")

      // Show a success message
      setError("Design changes applied successfully!")

      // Clear the message after a few seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    } catch (error) {
      setError("Failed to generate design changes. Please try again.")
      console.error("Error generating design:", error)
    } finally {
      setIsGeneratingDesign(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="browser" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="browser">Browser</TabsTrigger>
          <TabsTrigger value="permissions">Device Access</TabsTrigger>
          <TabsTrigger value="ai-designer">AI Designer</TabsTrigger>
          <TabsTrigger value="code-editor">Code Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="h-[calc(100%-48px)]">
          <div className="mb-4 flex items-center space-x-2">
            <Button variant="outline" size="icon" disabled={historyIndex <= 0} onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={historyIndex >= history.length - 1} onClick={goForward}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <form onSubmit={handleNavigate} className="flex-1">
              <div className="flex">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="rounded-r-none"
                />
                <Button type="submit" className="rounded-l-none">
                  Go
                </Button>
              </div>
            </form>
            {currentUrl && (
              <Button variant="outline" size="icon" onClick={addBookmark} title="Add bookmark">
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
            <Select
              value={viewportMode}
              onValueChange={(value: "desktop" | "tablet" | "mobile") => setViewportMode(value)}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Viewport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">
                  <div className="flex items-center">
                    <Laptop className="mr-2 h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Tablet
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {currentUrl && (
              <Button variant="outline" size="sm" onClick={inspectWebsite}>
                <Code className="mr-2 h-4 w-4" />
                Inspect
              </Button>
            )}
          </div>

          {bookmarks.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {bookmarks.map((bookmark, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => navigateToBookmark(bookmark.url)}
                >
                  <Globe className="mr-2 h-3 w-3" />
                  {bookmark.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookmark(bookmark.url)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Button>
              ))}
            </div>
          )}

          {error && (
            <Alert variant={error.includes("successfully") ? "default" : "destructive"} className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Permission request notifications */}
          {permissionRequests.length > 0 && (
            <div className="mb-4 space-y-2">
              {permissionRequests.map((request, index) => (
                <Alert key={index} className="flex items-center justify-between">
                  <AlertDescription>This website is requesting access to your {request.type}.</AlertDescription>
                  {request.granted === null ? (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handlePermissionResponse(index, false)}>
                        Block
                      </Button>
                      <Button size="sm" onClick={() => handlePermissionResponse(index, true)}>
                        Allow
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm">{request.granted ? "Access granted" : "Access blocked"}</div>
                  )}
                </Alert>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="flex-1 rounded border">
              <iframe
                srcDoc={previewHtml}
                className="h-full w-full"
                sandbox="allow-scripts"
                title="Edited content preview"
              />
            </div>
          ) : currentUrl ? (
            <div
              className={`flex-1 rounded border ${
                viewportMode === "desktop"
                  ? "w-full"
                  : viewportMode === "tablet"
                    ? "mx-auto w-[768px]"
                    : "mx-auto w-[375px]"
              }`}
            >
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="h-full w-full"
                sandbox="allow-same-origin allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                title="Embedded content"
              />
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <Globe className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">Enter a URL above to browse websites</p>
              <p className="mt-2 text-center text-sm text-gray-400">
                Note: Some websites may block embedding due to security restrictions
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="h-[calc(100%-48px)]">
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-medium">Device Access Permissions</h2>
              <p className="mb-4 text-sm text-gray-500">
                Control which hardware devices and browser features the embedded websites can access. Note: These are
                simulated permissions for demonstration purposes.
              </p>

              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Camera</p>
                      <p className="text-sm text-gray-500">Allow websites to access your camera</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="camera-permission"
                      checked={devicePermissions.camera}
                      onCheckedChange={(checked) => {
                        setDevicePermissions({ ...devicePermissions, camera: checked })
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => requestPermission("camera")}>
                      Test Request
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Microphone</p>
                      <p className="text-sm text-gray-500">Allow websites to access your microphone</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="microphone-permission"
                      checked={devicePermissions.microphone}
                      onCheckedChange={(checked) => {
                        setDevicePermissions({ ...devicePermissions, microphone: checked })
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => requestPermission("microphone")}>
                      Test Request
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-500">Allow websites to access your location</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="location-permission"
                      checked={devicePermissions.location}
                      onCheckedChange={(checked) => {
                        setDevicePermissions({ ...devicePermissions, location: checked })
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => requestPermission("location")}>
                      Test Request
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">Allow websites to send notifications</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifications-permission"
                      checked={devicePermissions.notifications}
                      onCheckedChange={(checked) => {
                        setDevicePermissions({ ...devicePermissions, notifications: checked })
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => requestPermission("notifications")}>
                      Test Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">About Device Access</h2>
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="mb-2">
                  <strong>Note:</strong> This is a simulated implementation of device access permissions.
                </p>
                <p className="mb-2">
                  In a real implementation, accessing device hardware from embedded websites requires:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>A proxy server to modify website content</li>
                  <li>Special iframe configurations with appropriate permissions</li>
                  <li>User consent for each permission request</li>
                  <li>Handling of cross-origin security restrictions</li>
                </ul>
                <p className="mt-2">
                  Browser security restrictions prevent direct access to device hardware from embedded iframes without
                  explicit user permission and proper configuration.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-designer" className="h-[calc(100%-48px)]">
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-medium">AI Website Designer</h2>
              <p className="mb-4 text-sm text-gray-500">
                Describe how you want to modify the website's design, and our AI will apply those changes using the
                Gemini API.
              </p>

              <div className="space-y-4">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the design changes you want (e.g., 'Make the background blue', 'Increase the font size of all headings', 'Change the layout to a two-column grid')"
                  className="min-h-[100px]"
                />

                <Button
                  onClick={generateDesign}
                  disabled={isGeneratingDesign || !aiPrompt.trim() || !isEditing}
                  className="w-full"
                >
                  {isGeneratingDesign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Design Changes...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Apply Design Changes
                    </>
                  )}
                </Button>

                {!isEditing && (
                  <Alert>
                    <AlertDescription>
                      You need to inspect a website first before using the AI Designer. Click the "Inspect" button in
                      the Browser tab.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {designHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-md font-medium">Design History</h3>
                  <div className="space-y-2">
                    {designHistory.map((prompt, index) => (
                      <div key={index} className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Design #{designHistory.length - index}</span>
                          <span className="text-xs text-gray-500">Applied</span>
                        </div>
                        <p className="mt-1 text-gray-600">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code-editor" className="h-[calc(100%-48px)]">
          {isEditing ? (
            <Tabs defaultValue="html" className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={applyChanges}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Preview
                  </Button>
                  <Select value={editMode} onValueChange={(value: "visual" | "code") => setEditMode(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Edit Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Editor</SelectItem>
                      <SelectItem value="code">Code Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="html" className="h-[calc(100%-48px)]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">HTML Editor</span>
                    </div>
                  </div>
                  <textarea
                    value={editedHtml}
                    onChange={(e) => setEditedHtml(e.target.value)}
                    className="flex-1 resize-none bg-black p-4 font-mono text-xs text-green-400 focus:outline-none"
                    spellCheck="false"
                  />
                </div>
              </TabsContent>

              <TabsContent value="css" className="h-[calc(100%-48px)]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">CSS Editor</span>
                    </div>
                  </div>
                  <textarea
                    value={editedCss}
                    onChange={(e) => setEditedCss(e.target.value)}
                    className="flex-1 resize-none bg-black p-4 font-mono text-xs text-green-400 focus:outline-none"
                    spellCheck="false"
                  />
                </div>
              </TabsContent>

              <TabsContent value="js" className="h-[calc(100%-48px)]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">JavaScript Editor</span>
                    </div>
                  </div>
                  <textarea
                    value={editedJs}
                    onChange={(e) => setEditedJs(e.target.value)}
                    className="flex-1 resize-none bg-black p-4 font-mono text-xs text-green-400 focus:outline-none"
                    spellCheck="false"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-[calc(100%-48px)]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={applyChanges}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      srcDoc={previewHtml}
                      className="h-full w-full"
                      sandbox="allow-scripts"
                      title="Code preview"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <Code className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">Inspect a website first to edit its code</p>
              <Button variant="outline" className="mt-4" onClick={inspectWebsite} disabled={!currentUrl}>
                <Code className="mr-2 h-4 w-4" />
                Inspect Current Website
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

