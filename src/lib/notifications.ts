import { prisma } from '@/lib/prisma'

export type NotificationType = 
  | 'follow'
  | 'post_comment'
  | 'post_like'
  | 'recording_comment'
  | 'recording_like'
  | 'beat_comment'
  | 'beat_like'
  | 'comment_reply'
  | 'post_share'
  | 'recording_share'
  | 'beat_share'

interface CreateNotificationParams {
  type: NotificationType
  senderId: string
  receiverId: string
  title: string
  message: string
  postId?: string
  recordingId?: string
  beatId?: string
  commentId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Don't create notification if user is notifying themselves
    if (params.senderId === params.receiverId) {
      return null
    }

    // Check if receiver exists and is active
    const receiver = await prisma.user.findUnique({
      where: { id: params.receiverId },
      select: { id: true, isActive: true }
    })

    if (!receiver || !receiver.isActive) {
      return null
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        type: params.type,
        senderId: params.senderId,
        receiverId: params.receiverId,
        title: params.title,
        message: params.message,
        postId: params.postId,
        recordingId: params.recordingId,
        beatId: params.beatId,
        commentId: params.commentId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true
          }
        }
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// Helper functions for specific notification types
export async function createFollowNotification(followerId: string, followingId: string) {
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { name: true, username: true }
  })

  if (!follower) return null

  const displayName = follower.name || follower.username || 'Someone'

  return createNotification({
    type: 'follow',
    senderId: followerId,
    receiverId: followingId,
    title: 'New follower',
    message: `${displayName} started following you`
  })
}

export async function createPostCommentNotification(
  commenterId: string,
  postId: string,
  content: string
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true }
  })

  if (!post) return null

  const commenter = await prisma.user.findUnique({
    where: { id: commenterId },
    select: { name: true, username: true }
  })

  if (!commenter) return null

  const displayName = commenter.name || commenter.username || 'Someone'
  const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content

  return createNotification({
    type: 'post_comment',
    senderId: commenterId,
    receiverId: post.userId,
    title: 'New comment on your post',
    message: `${displayName} commented: "${truncatedContent}"`,
    postId
  })
}

export async function createPostLikeNotification(likerId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true }
  })

  if (!post) return null

  const liker = await prisma.user.findUnique({
    where: { id: likerId },
    select: { name: true, username: true }
  })

  if (!liker) return null

  const displayName = liker.name || liker.username || 'Someone'

  return createNotification({
    type: 'post_like',
    senderId: likerId,
    receiverId: post.userId,
    title: 'Someone liked your post',
    message: `${displayName} liked your post`,
    postId
  })
}

export async function createRecordingCommentNotification(
  commenterId: string,
  recordingId: string,
  content: string
) {
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    select: { userId: true, title: true }
  })

  if (!recording) return null

  const commenter = await prisma.user.findUnique({
    where: { id: commenterId },
    select: { name: true, username: true }
  })

  if (!commenter) return null

  const displayName = commenter.name || commenter.username || 'Someone'
  const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content

  return createNotification({
    type: 'recording_comment',
    senderId: commenterId,
    receiverId: recording.userId,
    title: `New comment on "${recording.title}"`,
    message: `${displayName} commented: "${truncatedContent}"`,
    recordingId
  })
}

export async function createRecordingLikeNotification(likerId: string, recordingId: string) {
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    select: { userId: true, title: true }
  })

  if (!recording) return null

  const liker = await prisma.user.findUnique({
    where: { id: likerId },
    select: { name: true, username: true }
  })

  if (!liker) return null

  const displayName = liker.name || liker.username || 'Someone'

  return createNotification({
    type: 'recording_like',
    senderId: likerId,
    receiverId: recording.userId,
    title: `Someone liked "${recording.title}"`,
    message: `${displayName} liked your recording`,
    recordingId
  })
}

export async function createCommentReplyNotification(
  replierId: string,
  parentCommentId: string,
  content: string
) {
  const parentComment = await prisma.comment.findUnique({
    where: { id: parentCommentId },
    select: { userId: true }
  })

  if (!parentComment) return null

  const replier = await prisma.user.findUnique({
    where: { id: replierId },
    select: { name: true, username: true }
  })

  if (!replier) return null

  const displayName = replier.name || replier.username || 'Someone'
  const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content

  return createNotification({
    type: 'comment_reply',
    senderId: replierId,
    receiverId: parentComment.userId,
    title: 'Someone replied to your comment',
    message: `${displayName} replied: "${truncatedContent}"`,
    commentId: parentCommentId
  })
} 