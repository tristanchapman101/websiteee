"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PenLine, Save, Trash2, Plus, FileText } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  lastEdited: number
}

export default function NotesEditor() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem("dashboard_notes")
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)
        if (parsedNotes.length > 0) {
          setActiveNote(parsedNotes[0])
          setTitle(parsedNotes[0].title)
          setContent(parsedNotes[0].content)
        }
      } catch (e) {
        console.error("Failed to parse saved notes", e)
      }
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_notes", JSON.stringify(notes))
  }, [notes])

  // Update form when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title)
      setContent(activeNote.content)
    } else {
      setTitle("")
      setContent("")
    }
  }, [activeNote])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      lastEdited: Date.now(),
    }

    setNotes([newNote, ...notes])
    setActiveNote(newNote)
    setTitle(newNote.title)
    setContent("")
  }

  const saveNote = () => {
    if (!activeNote) return

    const updatedNote = {
      ...activeNote,
      title,
      content,
      lastEdited: Date.now(),
    }

    setNotes(notes.map((note) => (note.id === activeNote.id ? updatedNote : note)))

    setActiveNote(updatedNote)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (activeNote?.id === id) {
      const remainingNotes = notes.filter((note) => note.id !== id)
      setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
    }
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
            <TabsTrigger value="notes">All Notes</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={createNewNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>

        <TabsContent value="editor" className="h-[calc(100%-48px)]">
          {activeNote ? (
            <div className="flex h-full flex-col">
              <div className="mb-4 flex items-center space-x-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="flex-1"
                />
                <Button onClick={saveNote}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start typing your note here..."
                  className="h-full w-full resize-none rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {activeNote.lastEdited > 0 && (
                <div className="mt-2 text-xs text-gray-500">Last edited: {formatDate(activeNote.lastEdited)}</div>
              )}
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <PenLine className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No notes yet. Create a new note to get started!</p>
              <Button variant="outline" className="mt-4" onClick={createNewNote}>
                Create Note
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="h-[calc(100%-48px)]">
          {notes.length === 0 ? (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <FileText className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No notes yet. Create a new note to get started!</p>
              <Button variant="outline" className="mt-4" onClick={createNewNote}>
                Create Note
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                    activeNote?.id === note.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveNote(note)}
                >
                  <CardContent className="p-0">
                    <div className="border-b p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{note.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(note.lastEdited)}</p>
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-3 text-sm text-gray-600">{note.content || "Empty note"}</p>
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

