"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Play, Pause, Download, Eye, EyeOff, Calendar, Music, Trash2, AlertTriangle } from "lucide-react"
import { RecordingInteractions } from "@/components/recording-interactions"

interface Recording {
  id: string
  title: string
  description?: string
  fileUrl: string
  duration?: number
  votes: number
  likesCount: number
  commentsCount: number
  playsCount: number
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
  }
  beat?: {
    id: string
    title: string
    genre?: string
    bpm?: number
  }
}

export function UserRecordings() {
  const { data: session } = useSession()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordingToDelete, setRecordingToDelete] = useState<Recording | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchRecordings()
    }
  }, [session])

  useEffect(() => {
    // Listen for recording upload events
    const handleRecordingUploaded = () => {
      fetchRecordings()
    }

    window.addEventListener('recordingUploaded', handleRecordingUploaded)
    
    return () => {
      window.removeEventListener('recordingUploaded', handleRecordingUploaded)
    }
  }, [])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recordings/user')
      if (response.ok) {
        const data = await response.json()
        setRecordings(data.recordings)
      }
    } catch (error) {
      console.error('Error fetching recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const playRecording = (recording: Recording) => {
    // Stop any currently playing audio
    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause()
      audioElements[playingId].currentTime = 0
    }

    if (playingId === recording.id) {
      setPlayingId(null)
      return
    }

    // Create or get audio element
    let audio = audioElements[recording.id]
    if (!audio) {
      audio = new Audio(recording.fileUrl)
      audio.addEventListener('ended', () => setPlayingId(null))
      setAudioElements(prev => ({ ...prev, [recording.id]: audio }))
    }

    audio.play()
    setPlayingId(recording.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePublic = async (recordingId: string, currentIsPublic: boolean) => {
    try {
      const response = await fetch(`/api/recordings/${recordingId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !currentIsPublic }),
      })

      if (response.ok) {
        setRecordings(prev => 
          prev.map(rec => 
            rec.id === recordingId 
              ? { ...rec, isPublic: !currentIsPublic }
              : rec
          )
        )
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
    }
  }

  const handleDeleteClick = (recording: Recording) => {
    setRecordingToDelete(recording)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!recordingToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/recordings/${recordingToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setRecordings(prev => prev.filter(rec => rec.id !== recordingToDelete.id))
        
        // Stop playing if this recording was playing
        if (playingId === recordingToDelete.id) {
          setPlayingId(null)
          if (audioElements[recordingToDelete.id]) {
            audioElements[recordingToDelete.id].pause()
          }
        }

        // Clean up audio element
        if (audioElements[recordingToDelete.id]) {
          delete audioElements[recordingToDelete.id]
        }

        setDeleteDialogOpen(false)
        setRecordingToDelete(null)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete recording')
      }
    } catch (error) {
      console.error('Error deleting recording:', error)
      alert('Failed to delete recording')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setRecordingToDelete(null)
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const publicRecordings = recordings.filter(rec => rec.isPublic)
  const privateRecordings = recordings.filter(rec => !rec.isPublic)

  const RecordingCard = ({ recording }: { recording: Recording }) => (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{recording.title}</h4>
          {recording.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {recording.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playRecording(recording)}
            className="h-8 w-8 p-0"
            title={playingId === recording.id ? "Pause" : "Play"}
          >
            {playingId === recording.id ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePublic(recording.id, recording.isPublic)}
            className="h-8 w-8 p-0"
            title={recording.isPublic ? "Make private" : "Make public"}
          >
            {recording.isPublic ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(recording)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete recording"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {formatDate(recording.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          {recording.beat && (
            <Badge variant="outline" className="text-xs">
              <Music className="h-2 w-2 mr-1" />
              {recording.beat.title}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {recording.votes} votes
          </Badge>
        </div>
      </div>
      
      {/* Add like and comment interactions for public recordings */}
      {recording.isPublic && (
        <div className="pt-2 border-t">
          <RecordingInteractions
            recordingId={recording.id}
            initialLikesCount={recording.likesCount}
            initialCommentsCount={recording.commentsCount}
            size="sm"
          />
        </div>
      )}
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My Recordings
            <Badge variant="outline">{recordings.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet. Create your first recording above!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Released Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-600">Released</h3>
                  <Badge variant="outline" className="text-xs">
                    {publicRecordings.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {publicRecordings.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <p>No public recordings yet</p>
                    </div>
                  ) : (
                    publicRecordings.map(recording => (
                      <RecordingCard key={recording.id} recording={recording} />
                    ))
                  )}
                </div>
              </div>

              {/* Private Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <EyeOff className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold text-orange-600">Private</h3>
                  <Badge variant="outline" className="text-xs">
                    {privateRecordings.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {privateRecordings.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <p>No private recordings yet</p>
                    </div>
                  ) : (
                    privateRecordings.map(recording => (
                      <RecordingCard key={recording.id} recording={recording} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Recording
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this recording? This action cannot be undone.
            </p>
            {recordingToDelete && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="font-medium text-sm">{recordingToDelete.title}</p>
                {recordingToDelete.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {recordingToDelete.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {formatDate(recordingToDelete.createdAt)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3" />
                  Delete Recording
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 