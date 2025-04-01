"use client"

import React from "react"

import { useState, useEffect } from "react"
import { PanelGroup, Panel, PanelResizeHandle } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Gamepad2,
  Globe,
  ImageIcon,
  Bot,
  FileText,
  PenLine,
  TerminalIcon as Terminal2,
  Code,
  Clock,
  Maximize,
  Minimize,
  Camera,
  X,
  LayoutGrid,
  Smartphone,
  Laptop,
  Sun,
  Moon,
  Apple,
  Search,
  GripVertical,
} from "lucide-react"
import WebBrowser from "@/components/web-browser"
import PhotoGallery from "@/components/photo-gallery"
import AIAssistant from "@/components/ai-assistant"
import EssayDetector from "@/components/essay-detector"
import GameEmbed from "@/components/game-embed"
import NotesEditor from "@/components/notes-editor"
import Terminal from "@/components/terminal"
import CodeEditor from "@/components/code-editor"
import EnhancedCodeEditor from "@/components/enhanced-code-editor"
import CountdownTimer from "@/components/countdown-timer"
import AIBrowserAssistant from "@/components/ai-browser-assistant"
import BrowserScreenshot from "@/components/browser-screenshot"
import WebsiteInspector from "@/components/website-inspector"
import CalorieTracker from "@/components/calorie-tracker"
import { useTheme } from "next-themes"
import { DndContext, type DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"

type PanelType =
  | "web"
  | "photo"
  | "ai"
  | "essay"
  | "game"
  | "notes"
  | "terminal"
  | "code"
  | "enhanced-code"
  | "countdown"
  | "browser-ai"
  | "screenshot"
  | "inspector"
  | "calories"

interface DashboardPanel {
  id: string
  type: PanelType
  title: string
  content?: any
}

interface SortablePanelProps {
  panel: DashboardPanel
  children: React.ReactNode
  onRemove: (id: string) => void
  onMaximize: (id: string) => void
  isMaximized: boolean
}

function SortablePanel({ panel, children, onRemove, onMaximize, isMaximized }: SortablePanelProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: panel.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2 dark:bg-gray-800">
        <div className="flex items-center">
          <div {...attributes} {...listeners} className="mr-2 cursor-move">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <h3 className="font-medium">{panel.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {isMaximized ? (
            <Button variant="ghost" size="sm" onClick={() => onMaximize(panel.id)} className="h-6 w-6 p-0">
              <Minimize className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => onMaximize(panel.id)} className="h-6 w-6 p-0">
              <Maximize className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onRemove(panel.id)} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const [panels, setPanels] = useState<DashboardPanel[]>([
    { id: "1", type: "web", title: "Web Browser" },
    { id: "2", type: "ai", title: "AI Assistant" },
  ])
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const { theme, setTheme } = useTheme()

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
  )

  // Load panels from localStorage on initial render
  useEffect(() => {
    const savedPanels = localStorage.getItem("dashboard_panels")
    if (savedPanels) {
      try {
        setPanels(JSON.parse(savedPanels))
      } catch (e) {
        console.error("Failed to parse saved panels", e)
      }
    }

    const savedViewMode = localStorage.getItem("dashboard_view_mode")
    if (savedViewMode) {
      setViewMode(savedViewMode as "desktop" | "tablet" | "mobile")
    }
  }, [])

  // Save panels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_panels", JSON.stringify(panels))
  }, [panels])

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dashboard_view_mode", viewMode)
  }, [viewMode])

  const maximizePanel = (id: string) => {
    setMaximizedPanel(id === maximizedPanel ? null : id)
  }

  const addPanel = (type: PanelType) => {
    const newPanel: DashboardPanel = {
      id: Date.now().toString(),
      type,
      title: getPanelTitle(type),
    }
    setPanels([...panels, newPanel])
  }

  const removePanel = (id: string) => {
    setPanels(panels.filter((panel) => panel.id !== id))
    if (maximizedPanel === id) {
      setMaximizedPanel(null)
    }
  }

  const removeLastPanel = () => {
    if (panels.length > 0) {
      const lastPanel = panels[panels.length - 1]
      removePanel(lastPanel.id)
    }
  }

  const getPanelTitle = (type: PanelType): string => {
    switch (type) {
      case "web":
        return "Web Browser"
      case "photo":
        return "Photo Gallery"
      case "ai":
        return "AI Assistant"
      case "essay":
        return "Essay Detector"
      case "game":
        return "Game"
      case "notes":
        return "Notes"
      case "terminal":
        return "Terminal"
      case "code":
        return "Code Editor"
      case "enhanced-code":
        return "Enhanced Code Editor"
      case "countdown":
        return "Countdown"
      case "browser-ai":
        return "Browser AI"
      case "screenshot":
        return "Screenshot Tool"
      case "inspector":
        return "Website Inspector"
      case "calories":
        return "Calorie Tracker"
      default:
        return "New Panel"
    }
  }

  const renderPanelContent = (panel: DashboardPanel) => {
    switch (panel.type) {
      case "web":
        return <WebBrowser />
      case "photo":
        return <PhotoGallery />
      case "ai":
        return <AIAssistant />
      case "essay":
        return <EssayDetector />
      case "game":
        return <GameEmbed />
      case "notes":
        return <NotesEditor />
      case "terminal":
        return <Terminal />
      case "code":
        return <CodeEditor />
      case "enhanced-code":
        return <EnhancedCodeEditor />
      case "countdown":
        return <CountdownTimer />
      case "browser-ai":
        return <AIBrowserAssistant />
      case "screenshot":
        return <BrowserScreenshot />
      case "inspector":
        return <WebsiteInspector />
      case "calories":
        return <CalorieTracker />
      default:
        return <div>Unknown panel type</div>
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPanels((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div
      className={`flex h-screen flex-col ${
        viewMode === "mobile" ? "max-w-[375px] mx-auto" : viewMode === "tablet" ? "max-w-[768px] mx-auto" : "w-full"
      }`}
    >
      <header className="border-b bg-white p-4 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Multi-Feature Dashboard</h1>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode("desktop")}>
              <Laptop className={`mr-2 h-4 w-4 ${viewMode === "desktop" ? "text-primary" : ""}`} />
              Desktop
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("tablet")}>
              <LayoutGrid className={`mr-2 h-4 w-4 ${viewMode === "tablet" ? "text-primary" : ""}`} />
              Tablet
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("mobile")}>
              <Smartphone className={`mr-2 h-4 w-4 ${viewMode === "mobile" ? "text-primary" : ""}`} />
              Mobile
            </Button>

            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>

            <Button variant="outline" size="sm" onClick={removeLastPanel}>
              <X className="mr-2 h-4 w-4" />
              Remove Last Panel
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => addPanel("web")}>
            <Globe className="mr-2 h-4 w-4" />
            Web
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("photo")}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Photos
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("ai")}>
            <Bot className="mr-2 h-4 w-4" />
            AI
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("essay")}>
            <FileText className="mr-2 h-4 w-4" />
            Essay
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("game")}>
            <Gamepad2 className="mr-2 h-4 w-4" />
            Game
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("notes")}>
            <PenLine className="mr-2 h-4 w-4" />
            Notes
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("terminal")}>
            <Terminal2 className="mr-2 h-4 w-4" />
            Terminal
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("enhanced-code")}>
            <Code className="mr-2 h-4 w-4" />
            Code
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("countdown")}>
            <Clock className="mr-2 h-4 w-4" />
            Timer
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("browser-ai")}>
            <Bot className="mr-2 h-4 w-4" />
            Browser AI
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("screenshot")}>
            <Camera className="mr-2 h-4 w-4" />
            Screenshot
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("inspector")}>
            <Search className="mr-2 h-4 w-4" />
            Inspector
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPanel("calories")}>
            <Apple className="mr-2 h-4 w-4" />
            Calories
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {panels.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Welcome to your Dashboard</CardTitle>
                <CardDescription>Add panels to get started with your multi-feature workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addPanel("web")} className="flex flex-col h-24 items-center justify-center">
                    <Globe className="h-8 w-8 mb-2" />
                    Web Browser
                  </Button>
                  <Button onClick={() => addPanel("photo")} className="flex flex-col h-24 items-center justify-center">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    Photo Gallery
                  </Button>
                  <Button onClick={() => addPanel("ai")} className="flex flex-col h-24 items-center justify-center">
                    <Bot className="h-8 w-8 mb-2" />
                    AI Assistant
                  </Button>
                  <Button onClick={() => addPanel("game")} className="flex flex-col h-24 items-center justify-center">
                    <Gamepad2 className="h-8 w-8 mb-2" />
                    Games
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : maximizedPanel ? (
          // Render only the maximized panel
          panels
            .filter((panel) => panel.id === maximizedPanel)
            .map((panel) => (
              <div key={panel.id} className="h-full w-full">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2 dark:bg-gray-800">
                    <h3 className="font-medium">{panel.title}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setMaximizedPanel(null)} className="h-6 w-6 p-0">
                      <Minimize className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">{renderPanelContent(panel)}</div>
                </div>
              </div>
            ))
        ) : (
          // Render all panels in the panel group with drag and drop
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            <SortableContext items={panels.map((panel) => panel.id)} strategy={verticalListSortingStrategy}>
              <PanelGroup direction="horizontal">
                {panels.map((panel, index) => (
                  <React.Fragment key={panel.id}>
                    <Panel className="overflow-hidden">
                      <SortablePanel
                        panel={panel}
                        onRemove={removePanel}
                        onMaximize={maximizePanel}
                        isMaximized={maximizedPanel === panel.id}
                      >
                        {renderPanelContent(panel)}
                      </SortablePanel>
                    </Panel>
                    {index < panels.length - 1 && (
                      <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600" />
                    )}
                  </React.Fragment>
                ))}
              </PanelGroup>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

