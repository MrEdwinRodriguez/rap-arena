import { Header } from "@/components/header"
import { BeatLibrary } from "@/components/beat-library"

export default function BeatLibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Beat Library</h1>
          <p className="text-muted-foreground">Discover and use beats for your next track</p>
        </div>

        <BeatLibrary />
      </div>
    </div>
  )
} 