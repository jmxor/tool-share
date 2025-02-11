import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const uploadThing = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  imageUploader: uploadThing({
    image: {
      maxFileSize: "4MB",
      minFileCount: 1,
      maxFileCount: 15,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file uploaded:", file);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
