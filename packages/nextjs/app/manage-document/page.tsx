"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, FileUp, Plus, Search, Trash2, Upload, User, Users } from "lucide-react"

import { Button } from "~~/components/ui/button"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { toast } from "~~/components/ui/use-toast"
import { Toaster } from "~~/components/ui/toaster"

// Mock data for demonstration
const mockDocuments = [
  {
    id: "doc-1",
    title: "Employment Contract",
    createdAt: "2023-04-15",
    status: "In Progress",
  },
  {
    id: "doc-2",
    title: "Non-Disclosure Agreement",
    createdAt: "2023-04-10",
    status: "In Progress",
  },
  {
    id: "doc-3",
    title: "Project Proposal",
    createdAt: "2023-04-05",
    status: "Completed",
  },
]

const mockSigners = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Signed",
    signedAt: "2023-04-16",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Pending",
    signedAt: null,
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    status: "Pending",
    signedAt: null,
  },
]

export default function ManageDocument() {
  const [selectedDocument, setSelectedDocument] = useState<string>("")
  const [signers, setSigners] = useState(mockSigners)
  const [newSignerName, setNewSignerName] = useState("")
  const [newSignerEmail, setNewSignerEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleDocumentSelect = (value: string) => {
    setSelectedDocument(value)
    // In a real app, we would fetch the signers for this document
  }

  const handleAddSigner = () => {
    if (!newSignerName.trim() || !newSignerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and email for the new signer",
        variant: "destructive",
      })
      return
    }

    const newSigner = {
      id: signers.length + 1,
      name: newSignerName,
      email: newSignerEmail,
      status: "Pending",
      signedAt: null,
    }

    setSigners([...signers, newSigner])
    setNewSignerName("")
    setNewSignerEmail("")

    toast({
      title: "Success",
      description: "Signer added successfully",
    })
  }

  const handleRemoveSigner = (id: number) => {
    setSigners(signers.filter((signer) => signer.id !== id))

    toast({
      title: "Success",
      description: "Signer removed successfully",
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleFileUpload = () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would process the file here
    toast({
      title: "Success",
      description: `File "${file.name}" uploaded successfully`,
    })

    // Simulate adding users from the file
    const newSigners = [
      ...signers,
      {
        id: signers.length + 1,
        name: "User from CLX",
        email: "user1@example.com",
        status: "Pending",
        signedAt: null,
      },
      {
        id: signers.length + 2,
        name: "Another User from CLX",
        email: "user2@example.com",
        status: "Pending",
        signedAt: null,
      },
    ]

    setSigners(newSigners)
    setFile(null)

    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const filteredSigners = signers.filter(
    (signer) =>
      signer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const document = mockDocuments.find((doc) => doc.id === selectedDocument)

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Document</h1>
        <p className="mt-2 text-muted-foreground">Add or remove signers from your documents.</p>
      </div>

      <div className="grid gap-8">
        {/* Document Selection */}
        <div className="bg-neutral-100 rounded-xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
          <h2 className="text-xl font-bold mb-4">Select Document</h2>
          <Select value={selectedDocument} onValueChange={handleDocumentSelect}>
            <SelectTrigger className="w-full bg-white shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {mockDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {document && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-medium">{document.title}</h3>
                  <p className="text-sm text-neutral-500">
                    Created on {document.createdAt} • Status: {document.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedDocument && (
          <>
            {/* Tabs for Add Signers and Upload CLX */}
            <div className="bg-neutral-100 rounded-xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
              <Tabs defaultValue="add-signers">
                <TabsList className="mb-6 bg-white shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                  <TabsTrigger
                    value="add-signers"
                    className="data-[state=active]:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                  >
                    Add Signers
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload-clx"
                    className="data-[state=active]:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                  >
                    Upload CLX
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add-signers">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter signer's name"
                          value={newSignerName}
                          onChange={(e) => setNewSignerName(e.target.value)}
                          className="bg-white shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter signer's email"
                          value={newSignerEmail}
                          onChange={(e) => setNewSignerEmail(e.target.value)}
                          className="bg-white shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddSigner}
                      className="w-full shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d1d1,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Signer
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload-clx">
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <FileUp className="h-12 w-12 text-neutral-400" />
                        <div className="text-center">
                          <h3 className="font-medium">Upload CLX File</h3>
                          <p className="text-sm text-neutral-500 mt-1">Upload a CLX file containing multiple signers</p>
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".clx,.csv,.xlsx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label
                          htmlFor="file-upload"
                          className="cursor-pointer py-2 px-4 bg-neutral-100 rounded-md shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d1d1,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                        >
                          Select File
                        </Label>
                        {file && <div className="text-sm text-neutral-600">Selected: {file.name}</div>}
                      </div>
                    </div>
                    <Button
                      onClick={handleFileUpload}
                      className="w-full shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d1d1,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Process
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Current Signers */}
            <div className="bg-neutral-100 rounded-xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Current Signers</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Search signers"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                  />
                </div>
              </div>

              {filteredSigners.length > 0 ? (
                <div className="space-y-3">
                  {filteredSigners.map((signer) => (
                    <div
                      key={signer.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                          <User className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{signer.name}</h3>
                          <p className="text-sm text-neutral-500">{signer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded-full ${
                            signer.status === "Signed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {signer.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSigner(signer.id)}
                          className="rounded-full h-8 w-8 shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d1d1,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-neutral-300 mb-2" />
                  <h3 className="text-lg font-medium">No signers found</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {searchQuery ? "No signers match your search" : "Add signers to this document"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Toaster />
    </div>
  )
}

