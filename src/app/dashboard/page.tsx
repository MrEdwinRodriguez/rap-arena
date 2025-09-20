import { Header } from "@/components/header"
import { SocialFeed } from "@/components/social-feed"
import { DiscoverySection } from "@/components/discovery-section"
import { BeatLibrary } from "@/components/beat-library"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to RapArena</h1>
            <p className="text-muted-foreground">Your hub for rap talent discovery and creation</p>
          </div>
          <Link href="/recording-studio">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Mic className="h-5 w-5 mr-2" />
              Recording Studio
            </Button>
          </Link>
        </div>

        <div className="space-y-12">
          <BeatLibrary />
          <DiscoverySection />
          <SocialFeed />
        </div>
      </div>
    </div>
  )
}
