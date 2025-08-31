import { z } from 'zod/v4';

export const profilePictureSchema = z.object({
  image: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 5000000, 'Max 5MB upload size.')
    .refine(
      (f) => ['image/png', 'image/jpeg', 'image/webp'].includes(f.type),
      'Only PNG, JPEG and WEBP images are allowed.'
    )
    // https://www.codu.co/articles/validate-an-image-file-with-zod-jjhied8p
    .refine(
      (f) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const meetsDimensions =
                img.width > 64 && img.height > 64 && img.width < 1024 && img.height < 1024;
              resolve(meetsDimensions);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(f);
        }),
      {
        message:
          'Image dimensions are invalid. Please upload an image between 64x64 and 1024x1024 pixels.'
      }
    )
});
