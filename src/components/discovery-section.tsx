import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Zap, Trophy, ArrowRight } from "lucide-react"

const trendingArtists = [
  {
    id: "1",
    username: "MCFlow",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 3,
    genre: "Trap",
    weeklyGrowth: "+45%",
  },
  {
    id: "2",
    username: "RhymeKing",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 4,
    genre: "Boom Bap",
    weeklyGrowth: "+32%",
  },
  {
    id: "3",
    username: "BeatDropper",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 2,
    genre: "Drill",
    weeklyGrowth: "+28%",
  },
]

const risingTalent = [
  {
    id: "4",
    username: "FreshBars",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 1,
    genre: "Conscious",
    recentScore: 156,
  },
  {
    id: "5",
    username: "VoiceOfStreet",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 2,
    genre: "Trap",
    recentScore: 203,
  },
]

export function DiscoverySection() {
  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Discover New Talent</h2>
          <p className="text-xl text-muted-foreground">Find the next big stars before they blow up</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trending Artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.username} />
                    <AvatarFallback>{artist.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{artist.username}</h4>
                      <Badge className={`${getTierColor(artist.tier)} text-white text-xs`}>T{artist.tier}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{artist.genre}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {artist.weeklyGrowth}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowRight className="h-4 w-4 mr-2" />
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>

          {/* Rising Talent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Zap className="h-5 w-5 text-secondary" />
                Rising Talent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {risingTalent.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.username} />
                    <AvatarFallback>{artist.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{artist.username}</h4>
                      <Badge className={`${getTierColor(artist.tier)} text-white text-xs`}>
                        <Trophy className="w-3 h-3 mr-1" />T{artist.tier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{artist.genre}</span>
                      <span>•</span>
                      <span>Recent score: {artist.recentScore}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                </div>
              ))}

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground mb-3">Discover artists before they reach higher tiers</p>
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Explore More Rising Artists
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
