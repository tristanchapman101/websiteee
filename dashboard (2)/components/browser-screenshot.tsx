"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Download, Trash2 } from "lucide-react"

interface Screenshot {
  id: string
  url: string
  timestamp: number
  title: string
}

export default function BrowserScreenshot() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [targetUrl, setTargetUrl] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [screenshotTitle, setScreenshotTitle] = useState("")

  // Load screenshots from localStorage on initial render
  useEffect(() => {
    const savedScreenshots = localStorage.getItem("dashboard_screenshots")
    if (savedScreenshots) {
      try {
        setScreenshots(JSON.parse(savedScreenshots))
      } catch (e) {
        console.error("Failed to parse saved screenshots", e)
      }
    }
  }, [])

  // Save screenshots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_screenshots", JSON.stringify(screenshots))
  }, [screenshots])

  const captureScreenshot = async () => {
    if (!iframeRef.current) return

    setIsCapturing(true)

    try {
      // This is a simulated screenshot since we can't directly capture iframe content
      // from different origins due to browser security restrictions

      // In a real implementation, we would need a proxy server or browser extension
      // For now, we'll create a simulated screenshot

      const iframe = iframeRef.current

      // Create a canvas element to draw the screenshot
      const canvas = document.createElement("canvas")
      canvas.width = iframe.clientWidth
      canvas.height = iframe.clientHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Failed to get canvas context")
      }

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw a simulated browser window
      ctx.fillStyle = "#f0f0f0"
      ctx.fillRect(0, 0, canvas.width, 40)

      // Draw address bar
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(10, 10, canvas.width - 20, 20)

      // Draw URL text
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.fillText(targetUrl || "about:blank", 15, 25)

      // Draw content area border
      ctx.strokeStyle = "#e0e0e0"
      ctx.strokeRect(0, 40, canvas.width, canvas.height - 40)

      // Draw some simulated content
      ctx.fillStyle = "#000000"
      ctx.font = "16px Arial"
      ctx.fillText("Simulated webpage content", 20, 70)

      ctx.font = "12px Arial"
      for (let i = 0; i < 5; i++) {
        ctx.fillText(`This is a simulated screenshot of ${targetUrl || "a webpage"}`, 20, 100 + i * 20)
      }

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")

      // Create a new screenshot object
      const newScreenshot: Screenshot = {
        id: Date.now().toString(),
        url: dataUrl,
        timestamp: Date.now(),
        title: screenshotTitle || `Screenshot of ${targetUrl || "webpage"}`,
      }

      // Add to screenshots array
      setScreenshots([newScreenshot, ...screenshots])
      setScreenshotTitle("")
    } catch (error) {
      console.error("Error capturing screenshot:", error)
      alert("Failed to capture screenshot")
    } finally {
      setIsCapturing(false)
    }
  }

  const deleteScreenshot = (id: string) => {
    setScreenshots(screenshots.filter((screenshot) => screenshot.id !== id))
  }

  const downloadScreenshot = (screenshot: Screenshot) => {
    const a = document.createElement("a")
    a.href = screenshot.url
    a.download = `${screenshot.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Browser Screenshot Tool</h2>
        <p className="text-sm text-gray-500">Capture and save screenshots of web content</p>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <Input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Enter URL to load"
            className="flex-1"
          />
          <Button onClick={() => setTargetUrl(targetUrl)}>Load</Button>
        </div>
      </div>

      <div className="mb-4 flex-1 overflow-hidden rounded border">
        <iframe
          ref={iframeRef}
          src={targetUrl || "about:blank"}
          className="h-full w-full"
          sandbox="allow-same-origin allow-scripts allow-forms"
          referrerPolicy="no-referrer"
          title="Web content for screenshot"
        />
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <Input
            value={screenshotTitle}
            onChange={(e) => setScreenshotTitle(e.target.value)}
            placeholder="Screenshot title"
            className="flex-1"
          />
          <Button onClick={captureScreenshot} disabled={isCapturing}>
            <Camera className="mr-2 h-4 w-4" />
            {isCapturing ? "Capturing..." : "Capture Screenshot"}
          </Button>
        </div>
      </div>

      {screenshots.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-md font-medium">Saved Screenshots</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {screenshots.map((screenshot) => (
              <Card key={screenshot.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img src={screenshot.url || "/placeholder.svg"} alt={screenshot.title} className="w-full" />
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm"
                        onClick={() => downloadScreenshot(screenshot)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm"
                        onClick={() => deleteScreenshot(screenshot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium">{screenshot.title}</h4>
                    <p className="text-xs text-gray-500">{formatDate(screenshot.timestamp)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

