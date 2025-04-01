"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Trash2, ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Photo {
  id: string
  url: string
  name: string
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Create a local URL for the file
      const url = URL.createObjectURL(file)
      const newPhoto: Photo = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        url,
        name: file.name,
      }

      setPhotos((prev) => [...prev, newPhoto])
    })

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id))
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-medium">Photo Gallery</h2>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      <Tabs defaultValue="grid" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="viewer">Viewer</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="h-full">
          {photos.length === 0 ? (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No photos yet. Upload some to get started!</p>
              <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                Upload Photos
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.name}
                        className="aspect-square h-full w-full object-cover"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={() => handleDelete(photo.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs">{photo.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewer" className="h-full">
          {selectedPhoto ? (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{selectedPhoto.name}</p>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedPhoto.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
              <div className="flex-1 overflow-hidden rounded border">
                <img
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">
                {photos.length === 0
                  ? "No photos yet. Upload some to get started!"
                  : "Select a photo from the grid view to see it here"}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

