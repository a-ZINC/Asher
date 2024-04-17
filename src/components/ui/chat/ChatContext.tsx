import React, { createContext, ReactNode, useState,useEffect } from "react";
import { useToast } from "../use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITELIMIT } from "@/config/infinite-query";

type StreamResponse={
    addMessage:()=>void,
    message:string,
    handleInputChange:(event:React.ChangeEvent<HTMLTextAreaElement>)=>void,
    isLoading:boolean,
    setMessage:React.Dispatch<React.SetStateAction<string>>,
    isPending:boolean,
    isSuccess:boolean,
    backupmessage:string
}

export const ChatContext= createContext<StreamResponse>({
    addMessage:()=>{},
    message:"",
    handleInputChange:()=>{},
    isLoading:false,
    setMessage:(prevState)=>'',
    isPending:true,
    isSuccess:false,
    backupmessage:''
});
interface Props{
    fileId:string,
    children:ReactNode
}
export const ChatContextProvider=({fileId,children}:Props)=>{
    const [message,setMessage]=useState<string>('');
    const [backupmessage,setbackupMessage]=useState<string>('');
    const [isLoading,setisLoading]=useState(false);
    const {toast}=useToast();
    const utils=trpc.useContext();

    const {mutate:sendMessage,isPending,isSuccess,data}=useMutation({
        mutationFn: async ({message}:{message:string})=>{
            setisLoading(true);
            const response=await fetch('/api/message',{
                method:"POST",
                body: JSON.stringify({
                    fileId,
                    message
                }),
            });
            
            if(!response){
                throw new Error("failed to send message");
            }
            setisLoading(false);
            return response.body
        },
        onMutate: async ({message})=>{
            setbackupMessage(message);
            setMessage('');

            await utils.getFileMessages.cancel();

            const prevoiusmessages=utils.getFileMessages.getInfiniteData();

            utils.getFileMessages.setInfiniteData({
                fileId,
                limit:INFINITELIMIT},
            (old)=>{
                if(!old){
                    return {
                        pages: [],
                        pageParams: [],
                      }
                }
                let newPages = [...old.pages]

                let latestPage = newPages[0]!
      
                latestPage.message = [
                  {
                    createdAt: new Date().toISOString(),
                    id: crypto.randomUUID(),
                    text: message,
                    isUserMessage: true,
                  },
                  ...latestPage.message,
                ]
      
                newPages[0] = latestPage
      
                return {
                  ...old,
                  pages: newPages,
                }
              }
        
        )
        setisLoading(true);
        },
        onSuccess:async(stream)=>{
            setisLoading(false);
            if (!stream) {
                return toast({
                  title: 'There was a problem sending this message',
                  description:
                    'Please refresh this page and try again',
                  variant: 'destructive',
                })
              }
            console.log(stream);
        }

    })

    const addMessage=()=>sendMessage({message});
    const handleInputChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        setMessage(e.target.value);

    }
    useEffect(()=>{
        if(data){
            console.log(data)
        }
    },[data])

    return (
        <ChatContext.Provider value={
            {
                addMessage,
                message,
                handleInputChange,
                isLoading,
                setMessage,
                isPending,
                isSuccess,
                backupmessage
            }

        }>
            {children}
        </ChatContext.Provider>
    )
}