import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { model } from "@/lib/googlechat";
import { HumanMessage } from "@langchain/core/messages";
import { object } from "zod";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Stream } from "stream";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const buildGoogleGenAIPrompt = (messages:Message[]) => ({
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant')
      .map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: { text: message.content },
      })),
  });

export const POST = async(req:NextRequest)=>{

    const body=await req.json();
    const {getUser}=getKindeServerSession();
    const user=await getUser();
    console.log("user",user)
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
        console.log("file",file)
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
    console.log("vectorStore",vectorStore)
    const results=await vectorStore.similaritySearch(message,4);
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
    console.log("formatted",formattedMessages)
    const input2 = [
        new HumanMessage({
          content: [
            {   
                type:'text',
                role: 'assistant',
                text:
                  'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
              },
              { 
                type:'text',
                role: 'user',
                text: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
                
          \n----------------\n
          
          PREVIOUS CONVERSATION:
          ${formattedMessages.map((message) => {
            if (message.role === 'user') return `User: ${message.content}\n`
            return `Assistant: ${message.content}\n`
          })}
          
          \n----------------\n
          
          CONTEXT:
          ${results.map((r) => r.pageContent).join('\n\n')}
          
          USER INPUT: ${message}`,
              },
          ],
        }),
      ];
      

      
    const answer=await model.invoke(input2);
    console.log('hello');
    console.log(answer);
    
    await db.message.create({
        data: {
          text: String(answer.content),
          isUserMessage: false,
          fileId,
          userId:user.id,
        }});

    return new Response(String(answer.content));
}

