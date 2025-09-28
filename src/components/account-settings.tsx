"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertTriangle, 
  UserX, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle,
  XCircle
} from "lucide-react"

interface User {
  id: string
  name?: string
  username?: string
  email?: string
  isActive: boolean
  hideLocation?: boolean
  hideCityNickname?: boolean
  hideFullName?: boolean
  createdAt: string
}

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter()
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [message, setMessage] = useState("")
  
  // Privacy settings
  const [hideLocation, setHideLocation] = useState(user.hideLocation || false)
  const [hideCityNickname, setHideCityNickname] = useState(user.hideCityNickname || false)
  const [hideFullName, setHideFullName] = useState(user.hideFullName || false)
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false)
  
  // Username creation for full name hiding
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [isCreatingUsername, setIsCreatingUsername] = useState(false)
  
  // Helper function to check if user has a valid username
  const hasValidUsername = () => {
    return user.username && user.username.trim() !== ""
  }

  // Reset hideFullName if username becomes invalid
  useEffect(() => {
    if (!hasValidUsername()) {
      setHideFullName(false)
    }
  }, [user.username])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    
    try {
      const response = await fetch('/api/user/account/deactivate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage("Account deactivated successfully. Redirecting...")
        setShowDeactivateDialog(false)
        
        // Sign out and redirect after a brief delay
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/signin' })
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to deactivate account")
      }
    } catch (error) {
      console.error('Deactivation error:', error)
      setMessage("Failed to deactivate account")
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleReactivateAccount = async () => {
    setIsDeactivating(true)
    
    try {
      const response = await fetch('/api/user/account/reactivate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage("Account reactivated successfully!")
        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to reactivate account")
      }
    } catch (error) {
      console.error('Reactivation error:', error)
      setMessage("Failed to reactivate account")
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setMessage("Please type 'DELETE' to confirm account deletion")
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/user/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage("Account deleted successfully. Redirecting...")
        setShowDeleteDialog(false)
        
        // Sign out and redirect after a brief delay
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to delete account")
      }
    } catch (error) {
      console.error('Deletion error:', error)
      setMessage("Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    setIsUpdatingPrivacy(true)
    
    try {
      const response = await fetch(`/api/user/${user.id}/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hideLocation,
          hideCityNickname,
          hideFullName
        })
      })

      if (response.ok) {
        setMessage("Privacy settings updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to update privacy settings")
      }
    } catch (error) {
      console.error('Privacy update error:', error)
      setMessage("Failed to update privacy settings")
    } finally {
      setIsUpdatingPrivacy(false)
    }
  }

  const handleCreateUsername = async () => {
    const trimmedUsername = newUsername.trim()
    if (!trimmedUsername || trimmedUsername.length === 0) {
      setMessage("Please enter a valid username")
      return
    }

    setIsCreatingUsername(true)
    
    try {
      const response = await fetch(`/api/user/${user.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: trimmedUsername
        })
      })

      if (response.ok) {
        // Update local user object
        user.username = trimmedUsername
        setNewUsername("")
        setShowUsernameModal(false)
        
        // Enable the hideFullName setting now that username exists
        setHideFullName(true)
        
        // Now proceed with the privacy update
        setIsUpdatingPrivacy(true)
        
        const privacyResponse = await fetch(`/api/user/${user.id}/privacy`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hideLocation,
            hideCityNickname,
            hideFullName: true // Set to true since that was the user's intent
          })
        })

        if (privacyResponse.ok) {
          setMessage("Username created and privacy settings updated successfully!")
        } else {
          setMessage("Username created, but failed to update privacy settings")
        }
        
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to create username")
      }
    } catch (error) {
      console.error('Username creation error:', error)
      setMessage("Failed to create username")
    } finally {
      setIsCreatingUsername(false)
      setIsUpdatingPrivacy(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">
                Your account is currently {user.isActive ? 'active' : 'deactivated'}
              </p>
            </div>
            <Badge variant={user.isActive ? "default" : "secondary"} className="flex items-center gap-1">
              {user.isActive ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Deactivated
                </>
              )}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Account created:</strong> {formatDate(user.createdAt)}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes('success') 
            ? 'border-green-200 bg-green-50 text-green-800' 
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hideLocation"
                  checked={hideLocation}
                  onChange={(e) => setHideLocation(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="hideLocation" className="text-sm font-normal cursor-pointer">
                  Do not show location (city and state will be hidden from your profile)
                </Label>
              </div>
                             <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="hideCityNickname"
                   checked={hideCityNickname}
                   onChange={(e) => setHideCityNickname(e.target.checked)}
                   className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                 />
                 <Label htmlFor="hideCityNickname" className="text-sm font-normal cursor-pointer">
                   Do not show City/Hood Nickname (nickname will be hidden from your profile)
                 </Label>
               </div>
               <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="hideFullName"
                   checked={hasValidUsername() ? hideFullName : false}
                   disabled={!hasValidUsername()}
                   onChange={(e) => {
                     if (!hasValidUsername()) {
                       setShowUsernameModal(true)
                       return
                     }
                     setHideFullName(e.target.checked)
                   }}
                   className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${
                     !hasValidUsername() ? 'opacity-50 cursor-not-allowed' : ''
                   }`}
                 />
                 <Label 
                   htmlFor="hideFullName" 
                   className={`text-sm font-normal ${
                     !hasValidUsername() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                   }`}
                   onClick={() => {
                     if (!hasValidUsername()) {
                       setShowUsernameModal(true)
                     }
                   }}
                 >
                   Do not show full name (only username will be displayed on your profile)
                   {!hasValidUsername() && (
                     <span className="text-orange-600 ml-1">*Requires username</span>
                   )}
                 </Label>
               </div>
             </div>
            
            <Button 
              onClick={handlePrivacyUpdate}
              disabled={isUpdatingPrivacy}
              className="w-full sm:w-auto"
            >
              {isUpdatingPrivacy ? "Updating..." : "Update Privacy Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deactivation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Eye className="h-5 w-5" />
            Account Deactivation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              Deactivating your account will temporarily hide your profile and content from searches. 
              You can reactivate at any time by logging back in.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Your profile will not appear in searches</li>
              <li>• Your recordings and beats will be hidden</li>
              <li>• Your comments will remain visible</li>
              <li>• You can reactivate by logging in again</li>
            </ul>
          </div>

          {user.isActive ? (
            <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Deactivate Account
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to deactivate your account? This action will hide your profile 
                    and content from searches, but you can reactivate at any time.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeactivateDialog(false)}
                    disabled={isDeactivating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={handleDeactivateAccount}
                    disabled={isDeactivating}
                  >
                    {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleReactivateAccount}
              disabled={isDeactivating}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isDeactivating ? "Reactivating..." : "Reactivate Account"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">
              ⚠️ This action cannot be undone!
            </p>
            <p className="text-sm">
              Deleting your account will permanently remove your profile and hide your content. 
              You will not be able to recover your account.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Your profile will be permanently deleted</li>
              <li>• Your recordings and beats will be hidden forever</li>
              <li>• Your comments will show as "Deleted User"</li>
              <li>• You cannot recover or reactivate this account</li>
              <li>• This action is irreversible</li>
            </ul>
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <UserX className="h-4 w-4 mr-2" />
                Delete Account Permanently
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account Permanently
                </DialogTitle>
                <DialogDescription className="space-y-2">
                  <p>This action cannot be undone. This will permanently delete your account and remove all your data.</p>
                  <p className="font-medium text-red-600">
                    To confirm, type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> in the box below:
                  </p>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">Type "DELETE" to confirm</Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteConfirmation("")
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== "DELETE"}
                >
                  {isDeleting ? "Deleting..." : "Delete Account Forever"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Username Creation Modal */}
      <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Username Required
            </DialogTitle>
            <DialogDescription>
              To hide your full name, you must have a username. Please create a username to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">Username</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isCreatingUsername}
              />
              <p className="text-xs text-muted-foreground">
                Your username will be displayed as @{newUsername || "username"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUsernameModal(false)
                setNewUsername("")
                // Don't need to reset hideFullName since it was never actually set due to validation
              }}
              disabled={isCreatingUsername}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUsername}
              disabled={isCreatingUsername || !newUsername.trim() || newUsername.trim().length === 0}
            >
              {isCreatingUsername ? "Creating..." : "Create Username & Update Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 