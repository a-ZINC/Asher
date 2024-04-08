import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" });  

export const ourFileRouter = {
  
  fileUploader: f({ image: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
     
      const {getUser}=getKindeServerSession();
      const user=await getUser();
 
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
 
     
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;