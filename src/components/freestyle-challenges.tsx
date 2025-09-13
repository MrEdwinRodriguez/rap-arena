"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FreestyleRecorder } from "@/components/freestyle-recorder"
import { Zap, Trophy, Clock, Users, Shuffle, Target, Calendar, Crown } from "lucide-react"

interface Challenge {
  id: string
  title: string
  topic: string
  description: string
  difficulty: string
  timeLimit: number
  participants: number
  prize: string
  endsIn: string
}

interface RandomChallenge {
  id: string
  title: string
  topic: string
  timeLimit: number
  isRandom: boolean
}

type FreestyleChallenge = Challenge | RandomChallenge

const dailyChallenges = [
  {
    id: "daily-1",
    title: "Daily Grind",
    topic: "Success and Hustle",
    description: "Rap about your journey to success and the daily grind",
    difficulty: "Medium",
    timeLimit: 60,
    participants: 234,
    prize: "500 Arena Points",
    endsIn: "18h 32m",
  },
]

const weeklyChallenges = [
  {
    id: "weekly-1",
    title: "Hometown Heroes",
    topic: "Your City/Neighborhood",
    description: "Show love to where you're from and what made you who you are",
    difficulty: "Hard",
    timeLimit: 90,
    participants: 1247,
    prize: "Tier Boost + 2000 Points",
    endsIn: "4d 12h",
  },
]

const randomTopics = [
  "Pizza at 3 AM",
  "Time Travel",
  "Social Media",
  "Dreams vs Reality",
  "Childhood Memories",
  "Technology Takeover",
  "Love in the Digital Age",
  "Climate Change",
  "Space Exploration",
  "Artificial Intelligence",
  "Street Art",
  "Late Night Thoughts",
  "Money and Fame",
  "Family Bonds",
  "Overcoming Fear",
]

const leaderboard = [
  {
    id: "1",
    username: "FreestyleKing",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 4,
    score: 2847,
    submissions: 23,
  },
  {
    id: "2",
    username: "RapMachine",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 3,
    score: 2634,
    submissions: 31,
  },
  {
    id: "3",
    username: "VerseMaster",
    avatar: "/placeholder.svg?height=40&width=40",
    tier: 5,
    score: 2521,
    submissions: 18,
  },
]

export function FreestyleChallenges() {
  const [activeTab, setActiveTab] = useState("challenges")
  const [showRecorder, setShowRecorder] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<FreestyleChallenge | null>(null)
  const [randomTopic, setRandomTopic] = useState("")

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const generateRandomTopic = () => {
    const topic = randomTopics[Math.floor(Math.random() * randomTopics.length)]
    setRandomTopic(topic)
  }

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowRecorder(true)
  }

  const startRandomFreestyle = () => {
    if (!randomTopic) generateRandomTopic()
    setSelectedChallenge({
      id: "random",
      title: "Random Freestyle",
      topic: randomTopic,
      timeLimit: 60,
      isRandom: true,
    })
    setShowRecorder(true)
  }

  useEffect(() => {
    generateRandomTopic()
  }, [])

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Freestyle Challenges</h2>
          <p className="text-xl text-muted-foreground">Test your skills with random topics and compete for glory</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Challenges
            </TabsTrigger>
            <TabsTrigger value="freestyle" className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Random Freestyle
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-8">
            {/* Daily Challenges */}
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Daily Challenge
              </h3>
              <div className="grid gap-4">
                {dailyChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-serif text-xl">{challenge.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{challenge.description}</p>
                        </div>
                        <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-secondary" />
                          Topic: {challenge.topic}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.timeLimit}s limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.participants} joined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.prize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span>Ends in {challenge.endsIn}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => startChallenge(challenge)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Join Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Weekly Challenges */}
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-secondary" />
                Weekly Challenge
              </h3>
              <div className="grid gap-4">
                {weeklyChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-secondary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-serif text-xl">{challenge.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{challenge.description}</p>
                        </div>
                        <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-secondary" />
                          Topic: {challenge.topic}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.timeLimit}s limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.participants} joined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.prize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span>Ends in {challenge.endsIn}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => startChallenge(challenge)}
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      >
                        Join Weekly Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="freestyle" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl">Random Freestyle Generator</CardTitle>
                <p className="text-muted-foreground">Get a random topic and show your freestyle skills</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-semibold mb-2">Your Topic:</h3>
                  <div className="text-2xl font-serif font-bold text-primary mb-4">{randomTopic}</div>
                  <Button variant="outline" onClick={generateRandomTopic} className="bg-transparent">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generate New Topic
                  </Button>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      60 second limit
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Practice mode
                    </span>
                  </div>
                  <Button
                    onClick={startRandomFreestyle}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-lg px-8"
                  >
                    Start Freestyle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Freestyle Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{user.username}</h4>
                          <Badge className={`${getTierColor(user.tier)} text-white text-xs`}>
                            <Trophy className="w-3 h-3 mr-1" />T{user.tier}
                          </Badge>
                          {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Score: {user.score}</span>
                          <span>Submissions: {user.submissions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showRecorder && selectedChallenge && (
          <FreestyleRecorder
            challenge={selectedChallenge}
            onClose={() => {
              setShowRecorder(false)
              setSelectedChallenge(null)
            }}
          />
        )}
      </div>
    </section>
  )
}
