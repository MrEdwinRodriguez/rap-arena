import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Trophy, Users, Heart, MessageCircle } from "lucide-react"

interface UserProfileProps {
  user: {
    id: string
    username: string
    avatar?: string
    tier: number
    totalVotes: number
    followers: number
    recordings: number
    bio?: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="text-2xl font-serif">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold">{user.username}</h1>
            <Badge className={`${getTierColor(user.tier)} text-white`}>
              <Trophy className="w-4 h-4 mr-1" />
              Tier {user.tier} - {getTierName(user.tier)}
            </Badge>
          </div>

          {user.bio && <p className="text-muted-foreground max-w-md">{user.bio}</p>}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{user.recordings}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Mic className="w-4 h-4" />
              Recordings
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{user.totalVotes}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Heart className="w-4 h-4" />
              Total Votes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{user.followers}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              Followers
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Follow
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
