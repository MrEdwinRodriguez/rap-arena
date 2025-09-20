import { Header } from "@/components/header"
import { RecordingStudio } from "@/components/recording-studio"
import { FreestyleChallenges } from "@/components/freestyle-challenges"

export default function RecordingStudioPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recording Studio</h1>
          <p className="text-muted-foreground">Create your next masterpiece</p>
        </div>

        <div className="space-y-12">
          <RecordingStudio />
          <FreestyleChallenges />
        </div>
      </div>
    </div>
  )
} 