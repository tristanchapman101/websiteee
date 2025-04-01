"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

type Direction = "horizontal" | "vertical"

interface PanelGroupContextType {
  direction: Direction
  registerPanel: (id: string, initialSize?: number) => void
  unregisterPanel: (id: string) => void
  getPanelSize: (id: string) => number
  updatePanelSize: (id: string, size: number) => void
  startResize: (beforeId: string, afterId: string) => void
  resizing: boolean
}

const PanelGroupContext = createContext<PanelGroupContextType | null>(null)

export function PanelGroup({
  children,
  direction = "horizontal",
  className,
}: {
  children: React.ReactNode
  direction?: Direction
  className?: string
}) {
  const [panels, setPanels] = useState<Map<string, number>>(new Map())
  const [resizing, setResizing] = useState(false)
  const resizeInfoRef = useRef<{ beforeId: string; afterId: string } | null>(null)

  const registerPanel = (id: string, initialSize?: number) => {
    setPanels((prev) => {
      const newMap = new Map(prev)
      if (!newMap.has(id)) {
        newMap.set(id, initialSize || 1)
      }
      return newMap
    })
  }

  const unregisterPanel = (id: string) => {
    setPanels((prev) => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }

  const getPanelSize = (id: string) => {
    return panels.get(id) || 1
  }

  const updatePanelSize = (id: string, size: number) => {
    setPanels((prev) => {
      const newMap = new Map(prev)
      newMap.set(id, size)
      return newMap
    })
  }

  const startResize = (beforeId: string, afterId: string) => {
    resizeInfoRef.current = { beforeId, afterId }
    setResizing(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing || !resizeInfoRef.current) return

    const { beforeId, afterId } = resizeInfoRef.current
    const beforeSize = panels.get(beforeId) || 1
    const afterSize = panels.get(afterId) || 1

    const totalSize = beforeSize + afterSize
    const delta = direction === "horizontal" ? e.movementX : e.movementY
    const ratio = delta / 500 // Adjust sensitivity

    const newBeforeSize = Math.max(0.1, beforeSize + ratio * totalSize)
    const newAfterSize = Math.max(0.1, totalSize - newBeforeSize)

    setPanels((prev) => {
      const newMap = new Map(prev)
      newMap.set(beforeId, newBeforeSize)
      newMap.set(afterId, newAfterSize)
      return newMap
    })
  }

  const handleMouseUp = () => {
    setResizing(false)
    resizeInfoRef.current = null
  }

  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizing, panels])

  return (
    <PanelGroupContext.Provider
      value={{
        direction,
        registerPanel,
        unregisterPanel,
        getPanelSize,
        updatePanelSize,
        startResize,
        resizing,
      }}
    >
      <div className={cn("flex", direction === "horizontal" ? "flex-row" : "flex-col", className)}>{children}</div>
    </PanelGroupContext.Provider>
  )
}

export function Panel({
  children,
  id: propId,
  initialSize,
  className,
}: {
  children: React.ReactNode
  id?: string
  initialSize?: number
  className?: string
}) {
  const context = useContext(PanelGroupContext)
  const [id] = useState(() => propId || `panel-${Math.random().toString(36).substr(2, 9)}`)

  if (!context) {
    throw new Error("Panel must be used within a PanelGroup")
  }

  const { direction, registerPanel, unregisterPanel, getPanelSize } = context

  useEffect(() => {
    registerPanel(id, initialSize)
    return () => unregisterPanel(id)
  }, [id, initialSize])

  const size = getPanelSize(id)
  const style = {
    flexGrow: size,
    flexShrink: 1,
    flexBasis: 0,
  }

  return (
    <div className={cn("overflow-hidden", className)} style={style} data-panel-id={id}>
      {children}
    </div>
  )
}

export function PanelResizeHandle({
  className,
}: {
  className?: string
}) {
  const context = useContext(PanelGroupContext)
  const handleRef = useRef<HTMLDivElement>(null)

  if (!context) {
    throw new Error("PanelResizeHandle must be used within a PanelGroup")
  }

  const { direction, startResize } = context

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()

    const handle = handleRef.current
    if (!handle) return

    const prevPanel = handle.previousElementSibling as HTMLElement
    const nextPanel = handle.nextElementSibling as HTMLElement

    if (!prevPanel || !nextPanel) return

    const prevId = prevPanel.dataset.panelId
    const nextId = nextPanel.dataset.panelId

    if (!prevId || !nextId) return

    startResize(prevId, nextId)
  }

  return (
    <div
      ref={handleRef}
      className={cn(
        "flex items-center justify-center",
        direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize",
        className,
      )}
      onMouseDown={handleMouseDown}
    />
  )
}

