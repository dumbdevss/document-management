"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Link from "next/link"
import { ArrowLeft, FileText, File, X, Upload, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { nanoid } from "nanoid";
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import Navbar from "~~/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { useToast } from "~~/hooks/use-toast"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { useView } from "~~/hooks/scaffold-move/useView"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"

// Pinata API credentials - in a real app, these should be environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

// Success component that shows when document is created
const DocumentSuccessView = ({ docId, title, fileUrl }: { docId: string, title: string, fileUrl: string }) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Document Created Successfully
        </CardTitle>
        <CardDescription className="text-green-700">
          Your document has been uploaded to the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-white p-4">
          <div className="mb-2">
            <span className="font-semibold">Document Title:</span> {title}
          </div>
          <div className="mb-4 overflow-hidden text-ellipsis">
            <span className="font-semibold">IPFS Link:</span>{" "}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              View Document <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
          <Link href={`/manage-document/${docId}`}>
            <Button className="w-full">
              Manage Document
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

const DocumentCard = ({ document }: any) => {

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{document.title}</CardTitle>
        <CardDescription>ID: {document.id.substring(0, 8)}...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm text-muted-foreground">
          <span className="font-medium">Created:</span> {formatDate(document.created_at)}
        </div>
        <div className="mb-4 flex items-center text-sm">
          <span className="mr-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            {document.signers_count || 0} Signers
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {document.signed_count || 0} Signed
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <a 
          href={document.ipfs_hash} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline inline-flex items-center text-sm"
        >
          View Document <ExternalLink className="ml-1 h-3 w-3" />
        </a>
        <Link href={`/manage-document/${document.id}`}>
          <Button size="sm">Manage Document</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState("create")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [docuId, setDocId] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { connected, account } = useWallet()
  const { toast } = useToast();

  const { submitTransaction, transactionInProcess } = useSubmitTransaction("secure_docs");

  // Fetch user's documents for the View Documents tab
  const { data, error: docsError, isLoading: isLoadingDocs } = useView({
    moduleName: "secure_docs",
    functionName: "get_documents_by_signer",
    args: [account?.address as `0x${string}`],
  })

 let userDocuments = data?.[0]

  // Fetch specific document when one is created
  const { data: documentDataVal, error: docError, isLoading: isLoadingDoc } = useView({
    moduleName: "secure_docs",
    functionName: "get_document",
    args: [docuId],
  })

  let documentData = documentDataVal?.[0];

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
  }, [toast])

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
      const fileUrl = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`

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
      ])
      
      // Set submission successful state
      setIsSubmitted(true)

      toast({
        title: "Success",
        description: "Document created successfully. You can now manage signers from the document page.",
      })
    } catch (error) {
      console.error("Transaction error:", error)
      toast({
        title: "Transaction Failed",
        description: "There was an error creating the document.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setTitle("")
    setFile(null)
    setFileUrl("")
    setIsSubmitted(false)
    setDocId("")
  }

  const handleTabChange = (tab : any) => {
    setActiveTab(tab)
    if (tab === "create" && isSubmitted) {
      resetForm()
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
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="mt-2 text-muted-foreground">Create and manage your secure blockchain documents.</p>
        </div>

        <Tabs defaultValue="create" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="create" className="flex-1">Create Document</TabsTrigger>
            <TabsTrigger value="view" className="flex-1">View Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            {isSubmitted ? (
              <>
                <DocumentSuccessView docId={docuId} title={title} fileUrl={fileUrl} />
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={resetForm}>
                    Create Another Document
                  </Button>
                </div>
              </>
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Documents
                </CardTitle>
                <CardDescription>Manage your created and shared documents.</CardDescription>
              </CardHeader>
              <CardContent>
                {!connected && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Connect Your Wallet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please connect your wallet to view your documents.
                    </p>
                  </div>
                )}

                {connected && isLoadingDocs && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/70" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading your documents...</p>
                  </div>
                )}

                {connected && !isLoadingDocs && docsError && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-red-500">Failed to load documents. Please try again.</p>
                  </div>
                )}

                {connected && !isLoadingDocs && !docsError && userDocuments && userDocuments?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No Documents Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't created any documents yet.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("create")}
                    >
                      Create Your First Document
                    </Button>
                  </div>
                )}

                {connected && !isLoadingDocs && !docsError && userDocuments && userDocuments.length > 0 && (
                  <div>
                    {userDocuments.map((doc, index) => (
                      <DocumentCard key={index} document={doc} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}