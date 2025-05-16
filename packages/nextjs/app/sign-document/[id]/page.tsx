"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, FileText, Pen, ShieldAlert } from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { useToast } from "~~/hooks/use-toast"
import { useView } from "~~/hooks/scaffold-move/useView"
import Navbar from "~~/components/navbar"
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction"

export default function SignDocument() {
  const params = useParams()
  const documentId = params.id as string
  const [signature, setSignature] = useState("")

  const { toast } = useToast()
  const { submitTransaction, transactionInProcess } = useSubmitTransaction("secure_docs");
  const { account, connected } = useWallet();
  const walletAddress = account?.address

  // TODOs 16: get document data using useView hooks and documentId as argument
  const { data, error, isLoading, refetch } = {
    data: [[]],
    error: "",
    isLoading: false,
    refetch: () => {
      console.log("Refetching data...");
    },
  };

  // TODOs 17: replace the following mock data with the actual data from the useView hook
  const document =  {
    title: "", 
    ipfs_hash: "", 
    created_at: "",
    owner: "", 
    signatures: "", 
    allowed_signers:"",
  };

  // TODOs 18: check if the user is an allowed signer
  const isAllowedSigner = false;

  // TODOs 19: check if the user has already signed the document
  const hasAlreadySigned = false;

  const handleSignDocument = async () => {
    // TODOs 20: check if signature is empty and if the user is connected to the wallet and toast error

    // TODOs 21: interact with the smart contract to sign document, use submitTransaction function and toast success or error


  }

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
          <h1 className="text-3xl font-bold">Sign Document</h1>
          <p className="mt-2 text-muted-foreground">Review and sign this document if you're authorized.</p>
        </div>

        {document ? <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
              <CardDescription>Document ID: {documentId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-md border p-4 mb-4">
                <div>
                  <p className="font-medium">{document.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Owner: {document.owner && `${document.owner.substring(0, 6)}...${document.owner.substring(document.owner.length - 4)}`} •
                    Created: {new Date(document.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </div>
                {hasAlreadySigned && (
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    Already Signed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
              <CardDescription>
                Review the document carefully before signing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/50 p-4">
                {document.ipfs_hash ? (
                  <p className="text-sm">
                    Document is stored on IPFS with hash: {document.ipfs_hash}
                  </p>
                ) : (
                  <p className="text-sm">No document content available</p>
                )}
              </div>

              {isAllowedSigner ? (
                hasAlreadySigned ? (
                  <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md">
                    <Check className="h-5 w-5" />
                    <div>
                      <p className="font-medium">You have already signed this document</p>
                      <p className="text-sm">Your signature has been recorded on the blockchain</p>
                    </div>
                  </div>
                ) : (
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
                      signature. This will be recorded on the blockchain.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-md">
                  <ShieldAlert className="h-5 w-5" />
                  <div>
                    <p className="font-medium">You are not authorized to sign this document</p>
                    <p className="text-sm">Your wallet address is not on the allowed signers list</p>
                  </div>
                </div>
              )}
            </CardContent>
            {isAllowedSigner && !hasAlreadySigned && (
              <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4">
                <Button
                  onClick={handleSignDocument}
                  disabled={!signature.trim() || transactionInProcess}
                >
                  <Pen className="mr-1 h-4 w-4" />
                  {transactionInProcess ? "Signing..." : "Sign Document"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Signatures</CardTitle>
              <CardDescription>These signers have already signed the document</CardDescription>
            </CardHeader>
            <CardContent>
              {document.signatures && document.signatures.length > 0 ? (
                <div className="space-y-2">
                  {document.signatures.map((signerAddress, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <p className="font-medium">{`${signerAddress.substring(0, 6)}...${signerAddress.substring(signerAddress.length - 4)}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Authorized Signer
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
                <p className="text-center text-muted-foreground">No signatures yet</p>
              )}
            </CardContent>
          </Card>
        </div> :
          <div>
            <p className="text-lg text-muted-foreground">No document data available</p>
            <p className="text-sm text-muted-foreground">Please check the document ID or try again later.</p>
          </div>
        }
      </div>
    </div>
  )
}