"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BeatUploader } from "@/components/beat-uploader"
import { BeatPlayer } from "@/components/beat-player"
import BeatInteractions from "@/components/beat-interactions"
import { Music, Upload, TrendingUp, Filter, Heart, Download, Mic } from "lucide-react"

interface Beat {
  id: string
  title: string
  description?: string
  fileUrl: string
  genre?: string
  bpm?: number
  key?: string
  mood?: string
  tags: string[]
  duration?: number
  downloads: number
  likesCount: number
  createdAt: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
}

const mockBeats = [
  {
    id: "1",
    title: "Midnight Trap",
    producer: {
      username: "BeatMaker808",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 3,
    },
    genre: "Trap",
    bpm: 140,
    duration: 180,
    key: "C Minor",
    mood: "Dark",
    likes: 234,
    downloads: 89,
    createdAt: "2 days ago",
    audioUrl: "/placeholder-beat.mp3",
    waveformData: [0.3, 0.7, 0.4, 0.8, 0.5, 0.9, 0.2, 0.6, 0.7, 0.4],
    tags: ["808", "Dark", "Atmospheric"],
    price: "Free",
  },
  {
    id: "2",
    title: "Boom Bap Classic",
    producer: {
      username: "VintageBeats",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 4,
    },
    genre: "Boom Bap",
    bpm: 95,
    duration: 210,
    key: "A Minor",
    mood: "Nostalgic",
    likes: 156,
    downloads: 67,
    createdAt: "1 week ago",
    audioUrl: "/placeholder-beat.mp3",
    waveformData: [0.5, 0.6, 0.8, 0.3, 0.7, 0.4, 0.9, 0.2, 0.6, 0.5],
    tags: ["Vinyl", "Classic", "Jazzy"],
    price: "Free",
  },
  {
    id: "3",
    title: "Drill Energy",
    producer: {
      username: "ChiTownProducer",
      avatar: "/placeholder.svg?height=40&width=40",
      tier: 2,
    },
    genre: "Drill",
    bpm: 150,
    duration: 165,
    key: "F# Minor",
    mood: "Aggressive",
    likes: 298,
    downloads: 124,
    createdAt: "3 days ago",
    audioUrl: "/placeholder-beat.mp3",
    waveformData: [0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.8, 0.2, 0.6],
    tags: ["Hard", "Sliding", "Chicago"],
    price: "Free",
  },
]

export function BeatLibrary() {
  const [activeTab, setActiveTab] = useState("browse")
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  useEffect(() => {
    fetchBeats()
  }, [selectedGenre])

  const fetchBeats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedGenre) params.append('genre', selectedGenre)
      
      const response = await fetch(`/api/beats/default?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBeats(data.beats)
      } else {
        console.error('Failed to fetch beats')
        setBeats([])
      }
    } catch (error) {
      console.error('Error fetching beats:', error)
      setBeats([])
    } finally {
      setLoading(false)
    }
  }

  const genres = ["Trap", "Boom Bap", "Drill", "Lo-Fi", "Jazz Rap", "Experimental"]
  const moods = ["Dark", "Uplifting", "Chill", "Aggressive", "Nostalgic", "Atmospheric"]

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const filteredBeats = beats.filter((beat) => {
    if (selectedGenre && beat.genre !== selectedGenre) return false
    if (selectedMood && beat.mood !== selectedMood) return false
    return true
  })

  const clearFilters = () => {
    setSelectedGenre(null)
    setSelectedMood(null)
  }

  return (
    <section className="py-16 px-4 bg-muted/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Beat Library</h2>
          <p className="text-xl text-muted-foreground">
            Discover fire beats from talented producers and record your next hit
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Browse Beats
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Beat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  {/* Genre Filter */}
                  <div className="flex gap-1 flex-wrap">
                    {genres.map((genre) => (
                      <Button
                        key={genre}
                        variant={selectedGenre === genre ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                        className="text-xs"
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>

                  {/* Mood Filter */}
                  <div className="flex gap-1 flex-wrap">
                    {moods.map((mood) => (
                      <Button
                        key={mood}
                        variant={selectedMood === mood ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                        className="text-xs"
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>

                  {(selectedGenre || selectedMood) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                      Clear All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Beat Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading beats...</p>
                </div>
              ) : filteredBeats.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No beats found</p>
                </div>
              ) : (
                filteredBeats.map((beat) => (
                <Card key={beat.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={beat.user.image || "/placeholder.svg"} alt={beat.user.username || beat.user.name} />
                        <AvatarFallback>{(beat.user.username || beat.user.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-serif font-bold">{beat.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">by {beat.user.username || beat.user.name}</span>
                          <Badge className={`${getTierColor(beat.user.tier)} text-white text-xs`}>
                            T{beat.user.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Beat Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Genre:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {beat.genre}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">BPM:</span>
                        <span className="ml-2 font-semibold">{beat.bpm}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Key:</span>
                        <span className="ml-2 font-semibold">{beat.key}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mood:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {beat.mood}
                        </Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {beat.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Waveform */}
                    <BeatPlayer
                      beat={beat}
                      isPlaying={currentlyPlaying === beat.id}
                      onPlayToggle={() => setCurrentlyPlaying(currentlyPlaying === beat.id ? null : beat.id)}
                    />

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {beat.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {beat.downloads}
                        </span>
                      </div>
                      <span>{new Date(beat.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <BeatInteractions
                        beatId={beat.id}
                        initialLikesCount={beat.likesCount}
                        initialDownloadsCount={beat.downloads}
                        showCounts={false}
                        size="sm"
                        beatTitle={beat.title}
                      />
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                        <Mic className="h-4 w-4 mr-1" />
                        Record Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading beats...</p>
                </div>
              ) : [...beats]
                .sort((a, b) => b.likesCount - a.likesCount)
                .map((beat, index) => (
                  <Card key={beat.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-primary">#{index + 1}</div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={beat.user.image || "/placeholder.svg"} alt={beat.user.username || beat.user.name} />
                          <AvatarFallback>{(beat.user.username || beat.user.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-serif font-bold">{beat.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">by {beat.user.username || beat.user.name}</span>
                            <Badge className={`${getTierColor(beat.user.tier)} text-white text-xs`}>
                              T{beat.user.tier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <BeatPlayer
                        beat={beat}
                        isPlaying={currentlyPlaying === beat.id}
                        onPlayToggle={() => setCurrentlyPlaying(currentlyPlaying === beat.id ? null : beat.id)}
                      />

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {beat.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {beat.downloads}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {beat.genre}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                          <Mic className="h-4 w-4 mr-1" />
                          Record Over
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <BeatUploader />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
