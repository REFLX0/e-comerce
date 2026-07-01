// Simple utility for Cloudinary operations (e.g. for Admin uploads)
// Requires CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    throw new Error('Cloudinary not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'KiosqueTN_preset') // You must configure an upload preset in Cloudinary

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error?.message || 'Failed to upload image')
  }

  const data = await res.json()
  return data.secure_url // e.g. https://res.cloudinary.com/...
}

