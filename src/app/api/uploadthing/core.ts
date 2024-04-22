import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" });  

export const ourFileRouter = {
  
  freeplanuploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
     
      const {getUser}=getKindeServerSession();
      const user=await getUser();
      const subscriptionPlan=await getUserSubscriptionPlan();
 
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
 
     
      return { userId: user.id, subscriptionPlan};
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
       
        const blob= await response.blob();
     
        const loader=new PDFLoader(blob);
        const docs=await loader.load();
        const {subscriptionPlan}=metadata;
        const {isSubscribed}=subscriptionPlan;
        const pageAmt=docs.length;

        const isProExceeded =
          pageAmt >
          PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
        const isFreeExceeded =
          pageAmt >
          PLANS.find((plan) => plan.name === 'Free')!
            .pagesPerPdf

        if (
          (isSubscribed && isProExceeded) ||
          (!isSubscribed && isFreeExceeded)
        ) {
          await db.file.update({
            data: {
              uploadStatus: 'FAILED',
            },
            where: {
              id: createfile.id,
            },
          })
        }

        
        console.log("docs:",docs[0]?.pageContent)
      
        const pineconeIndex=pinecone.index('asher2');
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "embedding-001", // 768 dimensions
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        });
        
        const pineconedocs=await PineconeStore.fromDocuments(docs, embeddings, {
          pineconeIndex,
          namespace:createfile.id,
          maxConcurrency: 5, 
        });
       
        await db.file.update({
          data:{
            uploadStatus:"SUCCESS"
          },
          where:{
            id:createfile.id
          }
        });


        
    }catch(error){
        console.log(error);
        await db.file.update({
          data:{
            uploadStatus:"FAILED"
          },
          where:{
            id:createfile.id
          }
        }) 
        console.log("db failed")
      }

    }),
    proplanuploader: f({ pdf: { maxFileSize: "16MB" } })
    
    .middleware(async ({ req }) => {
     
      const {getUser}=getKindeServerSession();
      const user=await getUser();
      const subscriptionPlan=await getUserSubscriptionPlan();
 
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
 
     
      return { userId: user.id, subscriptionPlan};
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
       
        const blob= await response.blob();
     
        const loader=new PDFLoader(blob);
        const docs=await loader.load();
        const {subscriptionPlan}=metadata;
        const {isSubscribed}=subscriptionPlan;
        const pageAmt=docs.length;

        const isProExceeded =
          pageAmt >
          PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
        const isFreeExceeded =
          pageAmt >
          PLANS.find((plan) => plan.name === 'Free')!
            .pagesPerPdf

        if (
          (isSubscribed && isProExceeded) ||
          (!isSubscribed && isFreeExceeded)
        ) {
          await db.file.update({
            data: {
              uploadStatus: 'FAILED',
            },
            where: {
              id: createfile.id,
            },
          })
        }

        
        console.log("docs:",docs[0]?.pageContent)
      
        const pineconeIndex=pinecone.index('asher2');
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "embedding-001", // 768 dimensions
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        });
        
        const pineconedocs=await PineconeStore.fromDocuments(docs, embeddings, {
          pineconeIndex,
          namespace:createfile.id,
          maxConcurrency: 5, 
        });
       
        await db.file.update({
          data:{
            uploadStatus:"SUCCESS"
          },
          where:{
            id:createfile.id
          }
        });


        
    }catch(error){
        console.log(error);
        await db.file.update({
          data:{
            uploadStatus:"FAILED"
          },
          where:{
            id:createfile.id
          }
        }) 
        console.log("db failed")
      }

    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;