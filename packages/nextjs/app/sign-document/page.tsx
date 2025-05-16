"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle2, Clock, ExternalLink, Loader2, PenLine } from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "~~/components/ui/button"
import Navbar from "~~/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { useToast } from "~~/hooks/use-toast"
import { useView } from "~~/hooks/scaffold-move/useView"
import { Badge } from "~~/components/ui/badge"

export function SignDocumentAvailable() {
  return true;
}

export default function SignDocuments() {
  const { connected, account } = useWallet()
  const { toast } = useToast()

  // TODOs 22: get documents for the current user using useView hook
  const { data, error, isLoading } = {
    data: [[]],
    error: "",
    isLoading: false,
  };
  // Process data to handle null response or extract the first element
  const signerDocuments = data?.[0] || []

  // Format date safely

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

  // TODOs 23: check if the user has already signed the document
  const hasUserSigned = (document: any) => {
    return false; // Replace with actual logic to check if the user has signed the document
  };

  // Get the signing deadline if available
  const getDeadline = (document: any) => {
    return document.deadline ? formatDate(document.deadline) : "No deadline";
  };

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
          <h1 className="text-3xl font-bold">Documents to Sign</h1>
          <p className="mt-2 text-muted-foreground">
            Review and sign documents that require your signature
          </p>
        </div>

        {/* TODOs 24: Add a card to show the user that they need to connect their wallet */}
        {false && (
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Connect Your Wallet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Please connect your wallet to view documents that require your signature.
              </p>
            </CardContent>
          </Card>
        )}

        {/* TODOs 25: Add a card to show the user that the the document data is not yet available*/}
        {false && (
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/70" />
              <p className="mt-4 text-sm text-muted-foreground">Loading your documents...</p>
            </CardContent>
          </Card>
        )}

        {/* TODOs 26: Add a card to show the user that there was an error loading the documents */}
        {false && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-red-600">
                Error loading documents. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* TODOs 27: Add a card to show the user that there are no documents to sign */}
        {false && (
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No Documents</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                There are no documents requiring your signature at this time.
              </p>
            </CardContent>
          </Card>
        )}

        {connected && !isLoading && !error && signerDocuments.length > 0 && (
          <div className="grid gap-6">
            {signerDocuments.map((document: any, index) => (
              <Card key={index} className={hasUserSigned(document) ? "border-green-200" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">
                      {document.title}
                    </CardTitle>
                    {hasUserSigned(document) ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Signed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                        <Clock className="mr-1 h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="pt-1">
                    Document ID: {document.id?.substring(0, 8)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">{document.owner?.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{formatDate(document.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">{getDeadline(document)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Signers:</span>
                      <span className="font-medium">{document.signers?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Signed Count:</span>
                      <span className="font-medium">{document.signed_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-4">
                  <a
                    href={document.ipfs_hash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center text-sm"
                  >
                    View Document <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  {hasUserSigned(document) ? (
                    <Button variant="outline" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Already Signed
                    </Button>
                  ) : (
                    <Link href={`/sign-document/${document.id}`}>
                      <Button>
                        <PenLine className="mr-2 h-4 w-4" /> Sign Document
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}