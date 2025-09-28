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
import Link from "next/link"
import { FollowButton } from "@/components/follow-button"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
  bio?: string
  totalVotes: number
  publicRecordings: number
  joinedAt: string
}

// Mock data for recordings (we'll implement this later)
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
    weightedScore: 167,
    createdAt: "6 hours ago",
  },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([])
  const [filteredRecordings, setFilteredRecordings] = useState(mockRecordings)
  const [isLoading, setIsLoading] = useState(false)

  const tiers = [1, 2, 3, 4, 5]
  const genres = ["Trap", "Boom Bap", "Drill", "Conscious", "Alternative", "R&B"]

  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 30) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years} year${years > 1 ? 's' : ''} ago`
    }
  }

  // Search for artists
  const searchArtists = async (query: string, tier?: number) => {
    if (!query.trim()) {
      setSearchUsers([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10'
      })
      
      if (tier) {
        params.append('tier', tier.toString())
      }

      const response = await fetch(`/api/search/artists?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchUsers(data.users || [])
      } else {
        console.error('Search failed:', response.statusText)
        setSearchUsers([])
      }
    } catch (error) {
      console.error('Error searching artists:', error)
      setSearchUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Search artists when query or tier filter changes
    if (searchQuery.trim()) {
      searchArtists(searchQuery, selectedTier || undefined)
    } else {
      setSearchUsers([])
    }

    // Filter recordings (mock data for now)
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
    setSearchUsers([])
  }

  const handleCardClick = () => {
    onClose() // Close modal when navigating
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
                Artists ({searchUsers.length})
              </TabsTrigger>
              <TabsTrigger value="recordings" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Recordings ({filteredRecordings.length})
              </TabsTrigger>
            </TabsList>

            <div className="max-h-96 overflow-y-auto mt-4">
              <TabsContent value="all" className="space-y-4">
                {/* Loading State */}
                {isLoading && searchQuery && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}

                {/* Artists Section */}
                {searchUsers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Artists
                    </h3>
                    <div className="space-y-2">
                      {searchUsers.slice(0, 3).map((user) => (
                        <Link key={user.id} href={`/profile/${user.id}`} onClick={handleCardClick}>
                          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
                                  <AvatarFallback>
                                    {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{user.name || user.username}</h4>
                                    <Badge className={`${getTierColor(user.tier)} text-white text-xs`}>
                                      <Trophy className="w-3 h-3 mr-1" />T{user.tier}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{user.totalVotes} votes</span>
                                    <span>{user.publicRecordings} recordings</span>
                                    <span>Joined {formatTimeAgo(user.joinedAt)}</span>
                                  </div>
                                  {user.bio && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
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

                {/* No Results */}
                {!isLoading && searchQuery && searchUsers.length === 0 && filteredRecordings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try different keywords or adjust your filters</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="artists" className="space-y-2">
                {isLoading && searchQuery ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : searchUsers.length === 0 && searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No artists found for "{searchQuery}"</p>
                  </div>
                ) : (
                  searchUsers.map((user) => (
                    <Card key={user.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
                            <AvatarFallback>
                              {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/profile/${user.id}`} onClick={handleCardClick}>
                                <h4 className="font-semibold hover:text-primary cursor-pointer">{user.name || user.username}</h4>
                              </Link>
                              <Badge className={`${getTierColor(user.tier)} text-white text-xs`}>
                                <Trophy className="w-3 h-3 mr-1" />T{user.tier} {getTierName(user.tier)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{user.totalVotes} votes</span>
                              <span>{user.publicRecordings} recordings</span>
                              <span>Joined {formatTimeAgo(user.joinedAt)}</span>
                            </div>
                            {user.bio && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <FollowButton userId={user.id} size="sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="recordings" className="space-y-2">
                {filteredRecordings.length === 0 && searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recordings found for "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredRecordings.map((recording) => (
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
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
