import { Header } from "@/components/header"
import { SearchModal } from "@/components/search-modal"

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover Artists</h1>
          <p className="text-lg text-muted-foreground">
            Search and discover talented artists in the rap arena
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Find Artists</h2>
            <p className="text-muted-foreground mb-4">
              Use the search button in the header to find artists by name, username, or explore by tier.
            </p>
            <div className="text-center text-muted-foreground">
              <p>More artist discovery features coming soon!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 