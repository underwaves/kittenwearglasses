/**
 * Optimizes an image client-side before uploading:
 * - Resizes max dimension to 1280px (maintaining aspect ratio)
 * - Converts format to WebP with 0.85 quality
 */
export async function optimizeImage(file: File, maxDimension = 1280, quality = 0.85): Promise<File> {
  // If file is already small webp, return directly
  if (file.type === 'image/webp' && file.size < 400 * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(file) // Fallback to original if canvas fails
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
            const optimizedFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          },
          'image/webp',
          quality
        )
      }

      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
