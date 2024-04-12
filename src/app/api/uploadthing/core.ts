import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" });  

export const ourFileRouter = {
  
  fileUploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
     
      const {getUser}=getKindeServerSession();
      const user=await getUser();
 
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
 
     
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(file)
      const createfile=await db.file.create({
        data:{
          key:file.key,
          name:file.name,
          userId:metadata.userId,
          url:file.url,
          uploadStatus: 'PROCESSING'
        }
      });
      console.log(createfile)
      try{
        const response = await fetch(createfile?.url);
        console.log(response);
        const blob=
      }catch(error){

      }

    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;