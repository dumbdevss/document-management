"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, FileText, Pen } from "lucide-react"

import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { toast } from "~~/components/ui/use-toast"
import { Toaster } from "~~/components/ui/toaster"

// Mock data for demonstration
const mockDocuments = [
  {
    id: "doc-1",
    title: "Employment Contract",
    sender: "HR Department",
    date: "2023-04-15",
    status: "pending",
  },
  {
    id: "doc-2",
    title: "Non-Disclosure Agreement",
    sender: "Legal Team",
    date: "2023-04-10",
    status: "pending",
  },
  {
    id: "doc-3",
    title: "Project Proposal",
    sender: "Project Management",
    date: "2023-04-05",
    status: "signed",
  },
]

export default function SignDocument() {
  const [activeTab, setActiveTab] = useState("pending")
  const [documentId, setDocumentId] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<(typeof mockDocuments)[0] | null>(null)
  const [signature, setSignature] = useState("")

  const handleDocumentSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document ID",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would fetch the document from a database
    const document = mockDocuments.find((doc) => doc.id === documentId)

    if (document) {
      setSelectedDocument(document)
    } else {
      toast({
        title: "Document Not Found",
        description: "No document found with the provided ID",
        variant: "destructive",
      })
    }
  }

  const handleSignDocument = () => {
    if (!signature.trim()) {
      toast({
        title: "Error",
        description: "Please enter your signature",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would update the document status in a database
    toast({
      title: "Success",
      description: "Document signed successfully",
    })

    // Reset form
    setDocumentId("")
    setSelectedDocument(null)
    setSignature("")
  }

  const pendingDocuments = mockDocuments.filter((doc) => doc.status === "pending")
  const signedDocuments = mockDocuments.filter((doc) => doc.status === "signed")

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sign Document</h1>
        <p className="mt-2 text-muted-foreground">Sign documents that have been shared with you.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Find Document
            </CardTitle>
            <CardDescription>Enter the document ID to find and sign a document.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDocumentSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter document ID"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                />
              </div>
              <Button type="submit">Find Document</Button>
            </form>
          </CardContent>
        </Card>

        {selectedDocument && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedDocument.title}</CardTitle>
              <CardDescription>
                Sent by {selectedDocument.sender} on {selectedDocument.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm">
                  This is a sample document content. In a real application, the actual document content would be
                  displayed here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Your Signature</Label>
                <Input
                  id="signature"
                  placeholder="Type your full name to sign"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  By typing your name above, you agree that this electronic signature is as valid as a physical
                  signature.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4">
              <Button onClick={handleSignDocument}>
                <Pen className="mr-1 h-4 w-4" />
                Sign Document
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>View and manage documents shared with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending ({pendingDocuments.length})</TabsTrigger>
                <TabsTrigger value="signed">Signed ({signedDocuments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                {pendingDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {pendingDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {doc.sender} • Date: {doc.date}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDocumentId(doc.id)
                            setSelectedDocument(doc)
                          }}
                        >
                          Sign
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No pending documents</p>
                )}
              </TabsContent>
              <TabsContent value="signed">
                {signedDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {signedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {doc.sender} • Date: {doc.date}
                          </p>
                        </div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <Check className="mr-1 h-4 w-4" />
                          Signed
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No signed documents</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}

