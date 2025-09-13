"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RecordingCard } from "@/components/recording-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Trophy } from "lucide-react"

const mockRecordings = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "MCFlow",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 3,
    },
    title: "Late Night Vibes",
    duration: 45,
    likes: 127,
    dislikes: 8,
    comments: 23,
    createdAt: "2 hours ago",
    audioUrl: "/placeholder-audio.mp3",
    waveformData: [0.2, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.8, 0.2],
    weightedScore: 284,
    tierVotes: {
      1: { likes: 45, dislikes: 3 },
      2: { likes: 32, dislikes: 2 },
      3: { likes: 28, dislikes: 1 },
      4: { likes: 15, dislikes: 1 },
      5: { likes: 7, dislikes: 1 },
    },
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "RhymeKing",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 4,
    },
    title: "Street Chronicles",
    duration: 38,
    likes: 89,
    dislikes: 3,
    comments: 15,
    createdAt: "4 hours ago",
    audioUrl: "/placeholder-audio.mp3",
    waveformData: [0.3, 0.6, 0.8, 0.4, 0.9, 0.2, 0.7, 0.5, 0.6, 0.4],
    weightedScore: 198,
    tierVotes: {
      1: { likes: 35, dislikes: 1 },
      2: { likes: 25, dislikes: 1 },
      3: { likes: 18, dislikes: 0 },
      4: { likes: 8, dislikes: 1 },
      5: { likes: 3, dislikes: 0 },
    },
  },
  {
    id: "3",
    user: {
      id: "user3",
      username: "BeatDropper",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 2,
    },
    title: "Freestyle Friday",
    duration: 52,
    likes: 156,
    dislikes: 12,
    comments: 31,
    createdAt: "6 hours ago",
    audioUrl: "/placeholder-audio.mp3",
    waveformData: [0.5, 0.7, 0.3, 0.8, 0.4, 0.9, 0.2, 0.6, 0.7, 0.3],
    weightedScore: 312,
    tierVotes: {
      1: { likes: 68, dislikes: 8 },
      2: { likes: 42, dislikes: 2 },
      3: { likes: 28, dislikes: 1 },
      4: { likes: 12, dislikes: 1 },
      5: { likes: 6, dislikes: 0 },
    },
  },
]

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState("trending")
  const currentUserTier = 3 // This would come from authentication context

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold mb-4">Discover Talent</h2>
          <p className="text-xl text-muted-foreground">
            Listen to the hottest bars from the community and support rising artists
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            {mockRecordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} currentUserTier={currentUserTier} />
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {[...mockRecordings].reverse().map((recording) => (
              <RecordingCard key={recording.id} recording={recording} currentUserTier={currentUserTier} />
            ))}
          </TabsContent>

          <TabsContent value="top" className="space-y-6">
            {[...mockRecordings]
              .sort((a, b) => b.weightedScore - a.weightedScore)
              .map((recording) => (
                <RecordingCard key={recording.id} recording={recording} currentUserTier={currentUserTier} />
              ))}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="bg-transparent">
            Load More Recordings
          </Button>
        </div>
      </div>
    </section>
  )
}
