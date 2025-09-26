const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('You can find it in your Supabase project settings under API keys')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage buckets...\n')

  const buckets = [
    {
      name: 'recordings',
      options: {
        public: true,
        allowedMimeTypes: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      }
    },
    {
      name: 'beats',
      options: {
        public: true,
        allowedMimeTypes: ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac'],
        fileSizeLimit: 20 * 1024 * 1024, // 20MB
      }
    },
    {
      name: 'avatars',
      options: {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
      }
    }
  ]

  for (const bucket of buckets) {
    console.log(`📁 Creating bucket: ${bucket.name}`)
    
    const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.options)
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ⚠️  Bucket '${bucket.name}' already exists, skipping...`)
      } else {
        console.log(`   ❌ Error creating bucket '${bucket.name}':`, error.message)
      }
    } else {
      console.log(`   ✅ Successfully created bucket '${bucket.name}'`)
    }
  }

  console.log('\n🔐 Setting up storage policies...\n')

  // Create policies for each bucket
  const policies = [
    // Recordings policies
    {
      bucket: 'recordings',
      policy: {
        name: 'Users can upload their own recordings',
        definition: `(bucket_id = 'recordings') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'INSERT'
      }
    },
    {
      bucket: 'recordings',
      policy: {
        name: 'Users can view all recordings',
        definition: `bucket_id = 'recordings'`,
        action: 'SELECT'
      }
    },
    {
      bucket: 'recordings',
      policy: {
        name: 'Users can delete their own recordings',
        definition: `(bucket_id = 'recordings') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'DELETE'
      }
    },
    // Beats policies
    {
      bucket: 'beats',
      policy: {
        name: 'Users can upload their own beats',
        definition: `(bucket_id = 'beats') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'INSERT'
      }
    },
    {
      bucket: 'beats',
      policy: {
        name: 'Users can view all beats',
        definition: `bucket_id = 'beats'`,
        action: 'SELECT'
      }
    },
    {
      bucket: 'beats',
      policy: {
        name: 'Users can delete their own beats',
        definition: `(bucket_id = 'beats') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'DELETE'
      }
    },
    // Avatars policies
    {
      bucket: 'avatars',
      policy: {
        name: 'Users can upload their own avatars',
        definition: `(bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'INSERT'
      }
    },
    {
      bucket: 'avatars',
      policy: {
        name: 'Anyone can view avatars',
        definition: `bucket_id = 'avatars'`,
        action: 'SELECT'
      }
    },
    {
      bucket: 'avatars',
      policy: {
        name: 'Users can update their own avatars',
        definition: `(bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])`,
        action: 'UPDATE'
      }
    }
  ]

  console.log('⚠️  Storage policies need to be set up manually in the Supabase dashboard.')
  console.log('Go to: Storage > Policies in your Supabase dashboard')
  console.log('Create the following policies:\n')

  for (const policy of policies) {
    console.log(`📋 Bucket: ${policy.bucket}`)
    console.log(`   Name: ${policy.policy.name}`)
    console.log(`   Action: ${policy.policy.action}`)
    console.log(`   Definition: ${policy.policy.definition}\n`)
  }

  console.log('✅ Storage setup complete!')
  console.log('\n🎵 Your RapArena storage is ready for:')
  console.log('   • Recording uploads (up to 10MB)')
  console.log('   • Beat uploads (up to 20MB)')
  console.log('   • Avatar uploads (up to 2MB)')
}

setupStorageBuckets().catch(console.error) 