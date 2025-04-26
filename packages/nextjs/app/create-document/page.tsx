"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Link from "next/link"
import { ArrowLeft, FileText, File, X, Upload } from "lucide-react"
import { nanoid } from "nanoid";
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import Navbar from "~~/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { useToast } from "~~/hooks/use-toast"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"

// Pinata API credentials - in a real app, these should be environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

export default function CreateDocument() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [docuId, setDocId] = useState<string>("")
  const { connected } = useWallet()
  const { toast } = useToast();

  const { submitTransaction, transactionInProcess } = useSubmitTransaction("secure_docs")


  // File upload with react-dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)

    try {
      await uploadToPinata(selectedFile)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  })

  const uploadToPinata = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          "pinata_api_key": PINATA_API_KEY || "",
          "pinata_secret_api_key": PINATA_API_SECRET || "",
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload to Pinata")
      }

      const data = await response.json()
      const ipfsHash = data.IpfsHash
      const fileUrl = `${PINATA_GATEWAY}${ipfsHash}`

      setFileUrl(fileUrl)
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading to Pinata:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFileUrl("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!fileUrl) {
      toast({
        title: "Error",
        description: "Please upload a document file",
        variant: "destructive",
      })
      return
    }

    if (!connected) {
      console.log("Wallet not connected")
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      const id = nanoid();
      setDocId(id);
      // Submit transaction to blockchain
      await submitTransaction("upload_document", [
        title,
        fileUrl,
        id
      ]
      )

      console.log(fileUrl)

      toast({
        title: "Success",
        description: "Document created successfully. You can now manage signers from the document page.",
      })

      // Reset form
      setTitle("")
      setFile(null)
      setFileUrl("")
    } catch (error) {
      console.error("Transaction error:", error)
      toast({
        title: "Transaction Failed",
        description: "There was an error creating the document.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Document</h1>
          <p className="mt-2 text-muted-foreground">Upload a document to the blockchain. You can add signers after creation.</p>
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
                  <Label htmlFor="file">Document File</Label>
                  {!file ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                        }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 font-medium">
                        {isDragActive ? "Drop the file here" : "Drag and drop a file here, or click to select"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Supports PDF, DOC, DOCX, and TXT files
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  )}
                  {isUploading && (
                    <div className="mt-2 text-sm text-center text-muted-foreground">
                      Uploading file to IPFS...
                    </div>
                  )}
                  {fileUrl && (
                    <div className="mt-2 text-sm text-green-600">
                      File uploaded successfully to IPFS
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4">
                <Button type="submit" disabled={isUploading || transactionInProcess || !fileUrl}>
                  {transactionInProcess ? "Creating Document..." : "Create Document"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}