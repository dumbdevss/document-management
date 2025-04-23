import Link from "next/link"
import Navbar from "~~/components/navbar"
import { Check, FileText, Pen, Shield, Users } from "lucide-react"

import { Button } from "~~/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-10">
              {/* Hero Text Section */}
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Secure Document Management & Signing
                </h1>
                <p className="mx-auto text-muted-foreground md:text-xl">
                  Create, manage, and sign documents with ease. Our platform provides a secure and efficient way to
                  handle all your document needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href="/create-document">
                    <Button size="lg" className="w-full sm:w-auto">
                      Create Document
                    </Button>
                  </Link>
                  <Link href="/sign-document">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign Document
                    </Button>
                  </Link>
                  {/* <Link href="/manage-document">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Manage Document
                    </Button>
                  </Link> */}
                </div>
              </div>

              {/* Neomorphic Dashboard Preview */}
              <div className="w-full max-w-4xl mx-auto mt-16">
                <div className="bg-neutral-100 rounded-xl p-8 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
                  <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Document Dashboard</h2>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                        <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                        <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                      </div>
                    </div>

                    {/* Document List */}
                    <div className="grid gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                              <FileText className="h-5 w-5 text-neutral-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Employment Contract</h3>
                              <p className="text-sm text-neutral-500">Awaiting your signature</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]"
                          >
                            <Pen className="h-4 w-4" />
                            <span className="sr-only">Sign</span>
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                              <FileText className="h-5 w-5 text-neutral-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Non-Disclosure Agreement</h3>
                              <p className="text-sm text-neutral-500">Awaiting your signature</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]"
                          >
                            <Pen className="h-4 w-4" />
                            <span className="sr-only">Sign</span>
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                              <FileText className="h-5 w-5 text-neutral-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Project Proposal</h3>
                              <p className="text-sm text-neutral-500">Signed on April 5, 2023</p>
                            </div>
                          </div>
                          <div className="rounded-full h-8 w-8 flex items-center justify-center bg-neutral-100 shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signature Area Preview */}
                    <div className="mt-4 bg-white rounded-lg p-6 shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]">
                      <h3 className="text-lg font-medium mb-3">Sign Document</h3>
                      <div className="flex flex-col space-y-4">
                        <div className="h-16 bg-neutral-50 rounded-lg shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center">
                          <p className="text-neutral-400 italic">Your signature here</p>
                        </div>
                        <Button className="w-full shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff]">
                          Complete Signing
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="container flex flex-col gap-6 py-8 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">DocSign</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} DocSign. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

