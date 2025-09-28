import { Header } from "@/components/header"
import { DiscoverySection } from "@/components/discovery-section"

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover New Talent</h1>
          <p className="text-lg text-muted-foreground">
            Explore trending recordings, rising artists, and the hottest tracks in the rap arena
          </p>
        </div>
        
        <DiscoverySection />
      </main>
    </div>
  )
} 