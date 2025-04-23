"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Plus, Trash2, User } from "lucide-react"

import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Textarea } from "~~/components/ui/textarea"
import { toast } from "~~/components/ui/use-toast"
import { Toaster } from "~~/components/ui/toaster"

export default function CreateDocument() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [signers, setSigners] = useState<{ id: number; email: string }[]>([{ id: 1, email: "" }])

  const addSigner = () => {
    const newId = signers.length > 0 ? Math.max(...signers.map((s) => s.id)) + 1 : 1
    setSigners([...signers, { id: newId, email: "" }])
  }

  const removeSigner = (id: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((signer) => signer.id !== id))
    }
  }

  const updateSignerEmail = (id: number, email: string) => {
    setSigners(signers.map((signer) => (signer.id === id ? { ...signer, email } : signer)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document title",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter document content",
        variant: "destructive",
      })
      return
    }

    const emptySigners = signers.filter((s) => !s.email.trim())
    if (emptySigners.length > 0) {
      toast({
        title: "Error",
        description: "Please enter email addresses for all signers",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would save the document to a database here
    toast({
      title: "Success",
      description: "Document created successfully",
    })

    // Reset form
    setTitle("")
    setDescription("")
    setContent("")
    setSigners([{ id: 1, email: "" }])
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Document</h1>
        <p className="mt-2 text-muted-foreground">Create a new document and add signers to it.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
              <CardDescription>Enter the details of your document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter document description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Document Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter document content"
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Signers
              </CardTitle>
              <CardDescription>Add people who need to sign this document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {signers.map((signer) => (
                <div key={signer.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    value={signer.email}
                    onChange={(e) => updateSignerEmail(signer.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSigner(signer.id)}
                    disabled={signers.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove signer</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addSigner}>
                <Plus className="mr-1 h-4 w-4" />
                Add Another Signer
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4">
              <Button type="submit">Create Document</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
      <Toaster />
    </div>
  )
}

