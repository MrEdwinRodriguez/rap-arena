"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Trophy, Zap } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6">
            Where Rap Talent
            <span className="text-primary block">Gets Discovered</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Record your bars, compete in freestyle challenges, and climb the tiers. Join the community where every voice
            matters and talent rises to the top.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center border-border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Record & Share</h3>
              <p className="text-muted-foreground">
                Drop your 20-60 second bars and let the community hear your talent
              </p>
            </Card>

            <Card className="p-6 text-center border-border bg-card">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Tier-Based Voting</h3>
              <p className="text-muted-foreground">
                Earn respect through quality votes. Higher tiers carry more weight
              </p>
            </Card>

            <Card className="p-6 text-center border-border bg-card">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Freestyle Challenges</h3>
              <p className="text-muted-foreground">Test your skills with random topics and compete with the best</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
