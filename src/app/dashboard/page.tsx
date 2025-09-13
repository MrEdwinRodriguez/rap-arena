import { Header } from "@/components/header"
import { RecordingStudio } from "@/components/recording-studio"
import { SocialFeed } from "@/components/social-feed"
import { DiscoverySection } from "@/components/discovery-section"
import { FreestyleChallenges } from "@/components/freestyle-challenges"
import { BeatLibrary } from "@/components/beat-library"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to RapArena</h1>
          <p className="text-muted-foreground">Your hub for rap talent discovery and creation</p>
        </div>

        <div className="space-y-12">
          <RecordingStudio />
          <BeatLibrary />
          <FreestyleChallenges />
          <DiscoverySection />
          <SocialFeed />
        </div>
      </div>
    </div>
  )
}
