import { browser } from '$app/environment';
import { z } from 'zod/v4';

export const backgroundSchema = z
  .object({
    image: z
      .instanceof(File, { message: 'Please upload a file.' })
      .optional()
      .refine((f) => !f || f.size < 5000000, 'Max 5MB upload size.')
      .refine(
        (f) => !f || ['image/png', 'image/jpeg', 'image/webp'].includes(f.type),
        'Only PNG, JPEG and WEBP images are allowed.'
      )
      // https://www.codu.co/articles/validate-an-image-file-with-zod-jjhied8p
      .refine(
        async (f) => {
          if (!f) return true;

          if (browser) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                  const meetsDimensions =
                    img.width >= 128 &&
                    img.height >= 128 &&
                    img.width <= 3840 &&
                    img.height <= 2160;
                  resolve(meetsDimensions);
                };
                img.src = e.target?.result as string;
              };
              reader.readAsDataURL(f);
            });
          } else {
            try {
              const sharp = await import('sharp');
              const buffer = Buffer.from(await f.arrayBuffer());
              const metadata = await sharp.default(buffer).metadata();

              const { width, height } = metadata;
              return (
                width && height && width >= 128 && height >= 128 && width <= 3840 && height <= 2160
              );
            } catch {
              return false;
            }
          }
        },
        {
          message:
            'Image dimensions are invalid. Please upload an image between 128x128 and 3840x2160 pixels.'
        }
      ),
    blurPx: z.int().min(0).max(1024).optional()
  })
  .refine((data) => data.image !== undefined || data.blurPx !== undefined, {
    message: 'Provide an image or blur value.'
  });
