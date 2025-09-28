"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarUploader } from "@/components/avatar-uploader"
import { Badge } from "@/components/ui/badge"
import { Calendar, Save, Eye, EyeOff, Trophy } from "lucide-react"

interface User {
  id: string
  name?: string
  username?: string
  email?: string
  image?: string
  bio?: string
  birthday?: string
  city?: string
  countryId?: number
  stateId?: number
  stateProvince?: string
  tier: number
  totalVotes: number
  createdAt: string
}

interface Country {
  id: number
  name: string
  code: string
}

interface State {
  id: number
  name: string
  code: string
  countryId: number
}

interface EditProfileFormProps {
  user: User
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  
  // Profile fields
  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState(user.username || "")
  const [bio, setBio] = useState(user.bio || "")
  const [birthday, setBirthday] = useState(
    user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ""
  )
  const [city, setCity] = useState(user.city || "")
  const [countryId, setCountryId] = useState<number>(user.countryId || 1) // Default to US
  const [stateId, setStateId] = useState<number | undefined>(user.stateId)
  const [stateProvince, setStateProvince] = useState(user.stateProvince || "")
  
  // Data arrays
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  
  // Avatar upload
  const [currentAvatar, setCurrentAvatar] = useState(user.image || "")
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form state
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

  // Load countries and states
  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    if (countryId) {
      fetchStates(countryId)
    }
  }, [countryId])

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchStates = async (countryId: number) => {
    setLoadingStates(true)
    try {
      const response = await fetch(`/api/states/${countryId}`)
      if (response.ok) {
        const data = await response.json()
        setStates(data)
      }
    } catch (error) {
      console.error('Error fetching states:', error)
    } finally {
      setLoadingStates(false)
    }
  }

  const handleCountryChange = (value: string) => {
    const newCountryId = parseInt(value, 10)
    setCountryId(newCountryId)
    setStateId(undefined)
    setStateProvince("")
  }

  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl)
    setProfileMessage("Avatar updated successfully!")
    setTimeout(() => setProfileMessage(""), 3000)
  }

  const handleAvatarUploadError = (error: string) => {
    setProfileMessage(`Avatar upload failed: ${error}`)
    setTimeout(() => setProfileMessage(""), 5000)
  }

  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setProfileMessage("")

    try {
      const response = await fetch(`/api/user/${user.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          birthday: birthday || null,
          city: city.trim() || null,
          countryId: countryId,
          stateId: countryId === 1 ? stateId : null, // Only for US
          stateProvince: countryId === 1 ? null : stateProvince.trim() || null
        })
      })

      if (response.ok) {
        setProfileMessage("Profile updated successfully!")
        setTimeout(() => setProfileMessage(""), 3000)
      } else {
        const error = await response.json()
        setProfileMessage(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileMessage("Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    setPasswordMessage("")

    if (!currentPassword) {
      setPasswordMessage("Current password is required")
      setIsUpdatingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters")
      setIsUpdatingPassword(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match")
      setIsUpdatingPassword(false)
      return
    }

    try {
      const response = await fetch(`/api/user/${user.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        setPasswordMessage("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setPasswordMessage(""), 3000)
      } else {
        const error = await response.json()
        setPasswordMessage(error.error || "Failed to update password")
      }
    } catch (error) {
      console.error('Error updating password:', error)
      setPasswordMessage("Failed to update password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentAvatar || "/placeholder.svg"} alt={user.name || user.username} />
              <AvatarFallback className="text-xl">
                {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">{user.name || user.username}</h2>
                <Badge className={`${getTierColor(user.tier)} text-white`}>
                  <Trophy className="w-3 h-3 mr-1" />
                  T{user.tier} {getTierName(user.tier)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.totalVotes} total votes • Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <AvatarUploader
              currentImage={currentAvatar}
              userName={user.name}
              onUploadSuccess={handleAvatarUploadSuccess}
              onUploadError={handleAvatarUploadError}
            />
          </div>

          <Separator />

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={countryId.toString()} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  {countryId === 1 ? 'State' : 'State/Province'}
                </Label>
                {countryId === 1 ? (
                  <Select 
                    value={stateId ? stateId.toString() : undefined} 
                    onValueChange={(value) => setStateId(value ? parseInt(value, 10) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingStates ? (
                        <SelectItem value="loading" disabled>Loading states...</SelectItem>
                      ) : (
                        states.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="stateProvince"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="Your state/province"
                  />
                )}
              </div>
            </div>

            {profileMessage && (
              <div className={`p-3 rounded-md text-sm ${
                profileMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isUpdatingProfile}>
                <Save className="w-4 h-4 mr-2" />
                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-md text-sm ${
                passwordMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {passwordMessage}
              </div>
            )}

            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 