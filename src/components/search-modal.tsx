"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, Music, Filter, Trophy, Play, Clock } from "lucide-react"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data for search results
const mockArtists = [
  {
    id: "1",
    username: "MCFlow",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 3,
    followers: 1250,
    recordings: 45,
    genre: "Trap",
    location: "Atlanta, GA",
  },
  {
    id: "2",
    username: "RhymeKing",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 4,
    followers: 2100,
    recordings: 67,
    genre: "Boom Bap",
    location: "New York, NY",
  },
  {
    id: "3",
    username: "BeatDropper",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 2,
    followers: 890,
    recordings: 32,
    genre: "Drill",
    location: "Chicago, IL",
  },
]

const mockRecordings = [
  {
    id: "1",
    title: "Late Night Vibes",
    artist: "MCFlow",
    duration: 45,
    genre: "Trap",
    weightedScore: 284,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Street Chronicles",
    artist: "RhymeKing",
    duration: 38,
    genre: "Boom Bap",
    weightedScore: 198,
    createdAt: "4 hours ago",
  },
  {
    id: "3",
    title: "Freestyle Friday",
    artist: "BeatDropper",
    duration: 52,
    genre: "Drill",
    weightedScore: 312,
    createdAt: "6 hours ago",
  },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [filteredArtists, setFilteredArtists] = useState(mockArtists)
  const [filteredRecordings, setFilteredRecordings] = useState(mockRecordings)

  const genres = ["Trap", "Boom Bap", "Drill", "Conscious", "Mumble", "Old School"]
  const tiers = [1, 2, 3, 4, 5]

  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  useEffect(() => {
    // Filter artists based on search query and filters
    let filtered = mockArtists.filter(
      (artist) =>
        artist.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (selectedTier) {
      filtered = filtered.filter((artist) => artist.tier === selectedTier)
    }

    if (selectedGenre) {
      filtered = filtered.filter((artist) => artist.genre === selectedGenre)
    }

    setFilteredArtists(filtered)

    // Filter recordings
    let filteredRecs = mockRecordings.filter(
      (recording) =>
        recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.genre.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (selectedGenre) {
      filteredRecs = filteredRecs.filter((recording) => recording.genre === selectedGenre)
    }

    setFilteredRecordings(filteredRecs)
  }, [searchQuery, selectedTier, selectedGenre])

  const clearFilters = () => {
    setSelectedTier(null)
    setSelectedGenre(null)
    setSearchQuery("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Discover Artists & Music</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artists, recordings, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Tier Filter */}
            <div className="flex gap-1">
              {tiers.map((tier) => (
                <Button
                  key={tier}
                  variant={selectedTier === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                  className={`text-xs ${selectedTier === tier ? getTierColor(tier) + " text-white" : ""}`}
                >
                  T{tier}
                </Button>
              ))}
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

            {(selectedTier || selectedGenre || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear All
              </Button>
            )}
          </div>

          {/* Search Results */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Artists ({filteredArtists.length})
              </TabsTrigger>
              <TabsTrigger value="recordings" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Recordings ({filteredRecordings.length})
              </TabsTrigger>
            </TabsList>

            <div className="max-h-96 overflow-y-auto mt-4">
              <TabsContent value="all" className="space-y-4">
                {/* Artists Section */}
                {filteredArtists.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Artists
                    </h3>
                    <div className="space-y-2">
                      {filteredArtists.slice(0, 3).map((artist) => (
                        <Card key={artist.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.username} />
                                <AvatarFallback>{artist.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{artist.username}</h4>
                                  <Badge className={`${getTierColor(artist.tier)} text-white text-xs`}>
                                    <Trophy className="w-3 h-3 mr-1" />T{artist.tier}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {artist.genre}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{artist.followers} followers</span>
                                  <span>{artist.recordings} recordings</span>
                                  <span>{artist.location}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recordings Section */}
                {filteredRecordings.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Recordings
                    </h3>
                    <div className="space-y-2">
                      {filteredRecordings.slice(0, 3).map((recording) => (
                        <Card key={recording.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Button variant="outline" size="sm" className="w-10 h-10 rounded-full bg-transparent">
                                <Play className="h-4 w-4" />
                              </Button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{recording.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {recording.genre}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>by {recording.artist}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {recording.duration}s
                                  </span>
                                  <span>Score: {recording.weightedScore}</span>
                                  <span>{recording.createdAt}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="artists" className="space-y-2">
                {filteredArtists.map((artist) => (
                  <Card key={artist.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.username} />
                          <AvatarFallback>{artist.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{artist.username}</h4>
                            <Badge className={`${getTierColor(artist.tier)} text-white text-xs`}>
                              <Trophy className="w-3 h-3 mr-1" />T{artist.tier} {getTierName(artist.tier)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {artist.genre}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{artist.followers} followers</span>
                            <span>{artist.recordings} recordings</span>
                            <span>{artist.location}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recordings" className="space-y-2">
                {filteredRecordings.map((recording) => (
                  <Card key={recording.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="w-10 h-10 rounded-full bg-transparent">
                          <Play className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{recording.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {recording.genre}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>by {recording.artist}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recording.duration}s
                            </span>
                            <span>Score: {recording.weightedScore}</span>
                            <span>{recording.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
