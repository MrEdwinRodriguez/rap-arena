import { Header } from "@/components/header"
import { SocialFeed } from "@/components/social-feed"
import { Button } from "@/components/ui/button"
import { Mic, Music, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Feed</h1>
            <p className="text-muted-foreground">See what your followed artists are up to</p>
          </div>
          <div className="flex gap-3">
            <Link href="/recording-studio">
              <Button variant="outline" size="lg">
                <Mic className="h-5 w-5 mr-2" />
                Record
              </Button>
            </Link>
            <Link href="/beat-library">
              <Button variant="outline" size="lg">
                <Music className="h-5 w-5 mr-2" />
                Beats
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/discover">
            <div className="bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Discover</h3>
                  <p className="text-sm text-muted-foreground">Find new talent</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/trending">
            <div className="bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer border">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Trending</h3>
                  <p className="text-sm text-muted-foreground">Hot tracks</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/artists">
            <div className="bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer border">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Music className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Artists</h3>
                  <p className="text-sm text-muted-foreground">Browse artists</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <SocialFeed />
      </div>
    </div>
  )
}
