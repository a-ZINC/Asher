import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export const POST = async(req:NextRequest)=>{

    const body=await req.json();
    const {getUser}=getKindeServerSession();
    const user=await getUser();

    if(!user?.id){
        return new Response('Unauthorized',{status:401})
    }

    const {fileId,message} = SendMessageValidator.parse(body);

    const file=await db.file.findFirst({
        where:{
            id:fileId,
            userId:user?.id,
        }
    });

    if(!file) return new Response('Not Found',{status:404})
    
    await db.message.create({
        data:{
            text:message,
            isUserMessage:true,
            userId:user?.id,
            fileId
        }
    });

    //vectorize message
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "embedding-001", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      });
    
    const pineconeIndex=pinecone.index('asher2');

    const vectorStore=await PineconeStore.fromExistingIndex(embeddings,{
        pineconeIndex,
        namespace:file.id
    });

    const result=await vectorStore.similaritySearch(message,4);
    const prevMessage=await db.message.findMany({
        where:{
            fileId
        },
        orderBy:{
            createdAt:'asc',
        },
        take:6
    });

    const formattedMessages= prevMessage.map((msg)=>({
        role:msg.isUserMessage? "user" as const : "assistant" as const,
        content:msg.text
    }))
}