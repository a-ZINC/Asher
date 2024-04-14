import React, { createContext, ReactNode, useState } from "react";
import { useToast } from "../use-toast";
import { useMutation } from "@tanstack/react-query";

type StreamResponse={
    addMessage:()=>void,
    message:string,
    handleInputChange:(event:React.ChangeEvent<HTMLTextAreaElement>)=>void,
    isLoading:boolean,
    setMessage:React.Dispatch<React.SetStateAction<string>>
}

export const ChatContext= createContext<StreamResponse>({
    addMessage:()=>{},
    message:"",
    handleInputChange:()=>{},
    isLoading:false,
    setMessage:(prevState)=>'',
});
interface Props{
    fileId:string,
    children:ReactNode
}
export const ChatContextProvider=({fileId,children}:Props)=>{
    const [message,setMessage]=useState<string>('');
    const [isLoading,setisLoading]=useState(false);
    const {toast}=useToast();

    const {mutate:sendMessage}=useMutation({
        mutationFn: async ({message}:{message:string})=>{
            setisLoading(true);
            const response=await fetch('/api/message',{
                method:"POST",
                body: JSON.stringify({
                    fileId,
                    message
                }),
            })
            if(!response){
                throw new Error("failed to send message");
            }
            setisLoading(false);
            return response.body
        }
    })

    const addMessage=()=>sendMessage({message});
    const handleInputChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        setMessage(e.target.value);

    }

    return (
        <ChatContext.Provider value={
            {
                addMessage,
                message,
                handleInputChange,
                isLoading,
                setMessage
            }

        }>
            {children}
        </ChatContext.Provider>
    )
}