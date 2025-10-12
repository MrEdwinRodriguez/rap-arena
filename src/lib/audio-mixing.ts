// Audio mixing utilities for high-quality voice + beat mixing

export async function mixVoiceWithBeat(
  voiceBlob: Blob,
  beatBuffer: AudioBuffer,
  duration: number,
  beatVolume: number,
  voiceGainMultiplier: number = 1.2,
  bassGainDb: number = 0,
  trebleGainDb: number = 0
): Promise<Blob> {
  // Create audio context for mixing
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const sampleRate = audioContext.sampleRate
  
  // Decode voice recording
  const voiceArrayBuffer = await voiceBlob.arrayBuffer()
  const voiceBuffer = await audioContext.decodeAudioData(voiceArrayBuffer)
  
  // Use the full voice duration (voice recording is the source of truth)
  const mixDuration = voiceBuffer.duration
  const mixSamples = voiceBuffer.length
  
  console.log('Mixing details:')
  console.log('- Voice duration:', voiceBuffer.duration, 's')
  console.log('- Voice samples:', voiceBuffer.length)
  console.log('- Beat duration:', beatBuffer.duration, 's')
  console.log('- Beat samples:', beatBuffer.length)
  console.log('- Mix duration:', mixDuration, 's')
  console.log('- Mix samples:', mixSamples)
  console.log('- Sample rate:', sampleRate)
  
  // Create output buffer
  const outputBuffer = audioContext.createBuffer(
    2, // stereo
    mixSamples,
    sampleRate
  )
  
  // Get channel data
  const outputLeft = outputBuffer.getChannelData(0)
  const outputRight = outputBuffer.getChannelData(1)
  
  // Mix voice channels
  const voiceLeft = voiceBuffer.getChannelData(0)
  const voiceRight = voiceBuffer.numberOfChannels > 1 ? voiceBuffer.getChannelData(1) : voiceLeft
  const voiceLength = voiceBuffer.length
  
  // Mix beat channels (loop if necessary)
  const beatLeft = beatBuffer.getChannelData(0)
  const beatRight = beatBuffer.numberOfChannels > 1 ? beatBuffer.getChannelData(1) : beatLeft
  const beatLength = beatBuffer.length
  
  console.log('Channel data lengths:')
  console.log('- Voice left length:', voiceLeft.length)
  console.log('- Voice right length:', voiceRight.length)
  console.log('- Beat left length:', beatLeft.length)
  console.log('- Beat right length:', beatRight.length)
  
  // Convert dB to linear gain
  const bassGainLinear = Math.pow(10, bassGainDb / 20)
  const trebleGainLinear = Math.pow(10, trebleGainDb / 20)
  
  // Mix audio: voice + beat with volume control
  const voiceGain = voiceGainMultiplier
  const beatGain = beatVolume * 0.8 // Reduce beat volume slightly to keep voice prominent
  
  for (let i = 0; i < mixSamples; i++) {
    // Voice sample (or silence if voice is shorter)
    const voiceSampleL = i < voiceLength ? voiceLeft[i] * voiceGain : 0
    const voiceSampleR = i < voiceLength ? voiceRight[i] * voiceGain : 0
    
    // Beat sample (loop)
    const beatIndex = i % beatLength
    const beatSampleL = beatLeft[beatIndex] * beatGain
    const beatSampleR = beatRight[beatIndex] * beatGain
    
    // Mix and prevent clipping with soft limiting
    outputLeft[i] = softLimit(voiceSampleL + beatSampleL)
    outputRight[i] = softLimit(voiceSampleR + beatSampleR)
  }
  
  console.log('Mixing loop completed. Processed', mixSamples, 'samples')
  
  // Apply EQ if bass or treble adjustments are needed
  let finalBuffer = outputBuffer
  if (bassGainDb !== 0 || trebleGainDb !== 0) {
    console.log('Applying EQ: Bass', bassGainDb, 'dB, Treble', trebleGainDb, 'dB')
    finalBuffer = await applyEQ(audioContext, outputBuffer, bassGainLinear, trebleGainLinear)
  }
  
  // Convert to WAV blob (properly formatted for browser playback)
  const wavBlob = audioBufferToWav(finalBuffer)
  
  console.log('WAV blob created:')
  console.log('- Size:', wavBlob.size, 'bytes')
  console.log('- Type:', wavBlob.type)
  console.log('- Expected duration:', outputBuffer.duration, 's')
  
  audioContext.close()
  return wavBlob
}

// Convert AudioBuffer to properly formatted WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  console.log('audioBufferToWav called with:')
  console.log('- Buffer length:', buffer.length, 'samples')
  console.log('- Buffer duration:', buffer.duration, 's')
  console.log('- Buffer channels:', buffer.numberOfChannels)
  console.log('- Buffer sample rate:', buffer.sampleRate)
  
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  console.log('- Expected WAV file size:', length, 'bytes')
  
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels = []
  let offset = 0
  let pos = 0

  // Helper functions to write to DataView
  function setUint16(data: number) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true)
    pos += 4
  }

  // Write WAVE header
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  // Write fmt sub-chunk
  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * buffer.numberOfChannels * 2) // avg. bytes/sec
  setUint16(buffer.numberOfChannels * 2) // block-align
  setUint16(16) // 16-bit (hardcoded in this example)

  // Write data sub-chunk
  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  offset = pos
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      let sample = Math.max(-1, Math.min(1, channels[channel][i]))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, sample, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

// Apply EQ (bass and treble) to an audio buffer
async function applyEQ(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  bassGain: number,
  trebleGain: number
): Promise<AudioBuffer> {
  // Use OfflineAudioContext to process the audio
  const offlineContext = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  )
  
  // Create source
  const source = offlineContext.createBufferSource()
  source.buffer = buffer
  
  // Create bass filter (low shelf)
  const bassFilter = offlineContext.createBiquadFilter()
  bassFilter.type = 'lowshelf'
  bassFilter.frequency.value = 200 // Bass frequencies below 200Hz
  bassFilter.gain.value = (bassGain - 1) * 12 // Convert linear gain to dB adjustment
  
  // Create treble filter (high shelf)
  const trebleFilter = offlineContext.createBiquadFilter()
  trebleFilter.type = 'highshelf'
  trebleFilter.frequency.value = 3000 // Treble frequencies above 3kHz
  trebleFilter.gain.value = (trebleGain - 1) * 12 // Convert linear gain to dB adjustment
  
  // Connect the chain
  source.connect(bassFilter)
  bassFilter.connect(trebleFilter)
  trebleFilter.connect(offlineContext.destination)
  
  // Process
  source.start()
  const renderedBuffer = await offlineContext.startRendering()
  
  return renderedBuffer
}

// Soft limiter to prevent harsh clipping
function softLimit(sample: number): number {
  if (sample > 0.95) {
    return 0.95 + (sample - 0.95) * 0.2
  } else if (sample < -0.95) {
    return -0.95 + (sample + 0.95) * 0.2
  }
  return sample
}


