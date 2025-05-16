"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Plus, Search, Trash2, User, Users } from "lucide-react"

import { Button } from "~~/components/ui/button"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { useToast } from "~~/hooks/use-toast"
import Navbar from "~~/components/navbar"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"
import { useView } from "~~/hooks/scaffold-move/useView"

export default function ManageDocument() {
  const params = useParams()
  const documentId = params.id as string

  const [newSignerAddress, setNewSignerAddress] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const { toast } = useToast();
  const { submitTransaction, transactionInProcess } = useSubmitTransaction("secure_docs")

  // TODOs 13: get the document created by the user wallet connected using useView with documentId as argument
  const { data, error, isLoading, refetch } = {
    data: [[]],
    error: "",
    isLoading: false,
    refetch: () => {
      console.log("Refetching data...");
    },
  };

  // Parse document data
  const document = data ? {
    title: data[0], // doc.name
    ipfs_hash: data[1], // doc.ipfs_hash
    created_at: data[2], // doc.created_at
    owner: data[3], // doc.owner
    signatures: data[4], // doc.signatures
    allowed_signers: data[5], // doc.allowed_signers
  } : null;

  // Extract signers information
  const signers = document ?
    document.allowed_signers.map((address) => ({
      address,
      has_signed: document.signatures.some(sig => sig?.toLowerCase() === address?.toLowerCase())
    })) :
    [];

  // TODOs 14: implement function to add signer using useSubmitTransaction with function name as "add_signer" and arguments as [documentId, newSignerAddress]
  const handleAddSigner = async () => {
    return null
  }

  // TODOs 15: implement function to remove signer using useSubmitTransaction with function name as "remove_signer" and arguments as [documentId, signerAddress]
  const handleRemoveSigner = async (signerAddress: `0x${string}`) => {
    return null
  }

  const filteredSigners = signers.filter((signer) =>
    signer.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading document details...</p>
        </div>
      </div>
    )
  }

  if (!document && !isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
          <p className="text-muted-foreground">The document you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/" className="mt-4">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold">Manage Document</h1>
          <p className="mt-2 text-muted-foreground">Add or remove signers from your document.</p>
        </div>

        <div className="grid gap-8">
          {/* Document Details */}
          <div className="bg-neutral-100 rounded-xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
            <h2 className="text-xl font-bold mb-4">Document Details</h2>

            <div className="mt-4 p-4 bg-white rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-medium">{document?.title || "Untitled Document"}</h3>
                  <p className="text-sm text-neutral-500">
                    ID: {documentId} • Created on {new Date(document?.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Signers */}
          <div className="bg-neutral-100 rounded-xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
            <h2 className="text-xl font-bold mb-4">Add Signer</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  placeholder="Enter signer's wallet address"
                  value={newSignerAddress}
                  onChange={(e) => setNewSignerAddress(e.target.value)}
                  className="bg-white shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                />
              </div>
              <Button
                onClick={handleAddSigner}
                disabled={transactionInProcess}
                className="w-full shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d1d1,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {transactionInProcess ? "Adding Signer..." : "Add Signer"}
              </Button>
            </div>
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

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading signers...</p>
              </div>
            ) : filteredSigners.length > 0 ? (
              <div className="space-y-3">
                {filteredSigners.map((signer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                        <User className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div>
                        <h3 className="font-medium truncate max-w-xs md:max-w-sm">{signer.address}</h3>
                        <p className="text-sm text-neutral-500">
                          {signer.has_signed ? "Signed" : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${signer.has_signed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {signer.has_signed ? "Signed" : "Pending"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSigner(signer.address)}
                        disabled={transactionInProcess}
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
        </div>
      </div>
    </div>
  )
}