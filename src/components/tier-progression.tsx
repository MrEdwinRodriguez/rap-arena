import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Zap } from "lucide-react"

interface TierProgressionProps {
  currentTier: number
  currentScore: number
  nextTierThreshold: number
  votingPower: number
}

export function TierProgression({ currentTier, currentScore, nextTierThreshold, votingPower }: TierProgressionProps) {
  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const getTierThresholds = () => [0, 100, 500, 1500, 4000, 10000]

  const getProgressToNextTier = () => {
    const thresholds = getTierThresholds()
    const currentThreshold = thresholds[currentTier - 1]
    const nextThreshold = thresholds[currentTier] || thresholds[thresholds.length - 1]

    if (currentTier >= 5) return 100 // Max tier reached

    const progress = ((currentScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const isMaxTier = currentTier >= 5

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Trophy className="h-5 w-5 text-primary" />
          Tier Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${getTierColor(currentTier)} text-white`}>
              <Trophy className="w-4 h-4 mr-1" />
              Tier {currentTier}
            </Badge>
            <span className="font-semibold">{getTierName(currentTier)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold">{votingPower}x Voting Power</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Score: {currentScore}</span>
            {!isMaxTier && <span>Next Tier: {nextTierThreshold}</span>}
          </div>

          {!isMaxTier ? (
            <Progress value={getProgressToNextTier()} className="h-3" />
          ) : (
            <div className="text-center py-2">
              <Badge className="bg-yellow-500 text-white">
                <Trophy className="w-4 h-4 mr-1" />
                Maximum Tier Reached!
              </Badge>
            </div>
          )}
        </div>

        {!isMaxTier && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {nextTierThreshold - currentScore} points needed for {getTierName(currentTier + 1)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((tier) => (
            <div key={tier} className="text-center">
              <div
                className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold ${
                  tier <= currentTier ? getTierColor(tier) + " text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {tier}
              </div>
              <div className="text-xs text-muted-foreground">{getTierName(tier)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
