"use client"
import { trpc } from "@/app/_trpc/client";
import ChatInput from "./chat/ChatInput";
import Messages from "./chat/Messages";
import { Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "./button";
import { ChatContextProvider } from "./chat/ChatContext";
interface filepageProps{
        fileId:string,
}
const ChatWrapper = ({fileId}:filepageProps) => {
    const fileuploadstatus=trpc.getFileUploadStatus.useQuery({
        fileId
    },
    {
    refetchInterval:(data)=>{
        console.log(data?.state?.data?.status)
        return data?.state?.data?.status==="SUCCESS" || data?.state?.data?.status==="FAILED" ? false : 500
}});

    if(fileuploadstatus.isLoading){
        return <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 ">
            <div className="flex-1 flex justify-center items-center flex-col mb-28 py-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className='h-8 w-8 text-blue-500 animate-spin'/>
                    <h3 className="font-semibold text-xl">Loading...</h3>
                    <p className="text-zinc-500 text-sm">We&apos;re preparing your PDF</p>
                </div>
            </div>
            <ChatInput isDisabled/>
        </div>
    }
    if(fileuploadstatus?.data?.status==='PROCESSING'){
        return <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2 ">
            <div className="flex-1 flex justify-center items-center flex-col mb-28 py-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className='h-8 w-8 text-blue-500 animate-spin'/>
                    <h3 className="font-semibold text-xl">Processing PDF...</h3>
                    <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
                </div>
            </div>
            <ChatInput isDisabled/>
        </div>
    }
    if(fileuploadstatus?.data?.status==='FAILED'){
        return <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col gap-2">
            <div className="flex-1 flex justify-center items-center flex-col mb-28 py-10">
                <div className="flex flex-col items-center gap-2">
                    <XCircle className='h-8 w-8 text-red-500'/>
                    <h3 className="font-semibold text-xl">To many pades in PDF</h3>
                    <p className="text-zinc-500 text-sm">Your <span className="font-medium">Free</span>{' '} plan supports upto 5 pages per pdf</p>
                    <Link
                        href='/dashboard'
                        className={buttonVariants({
                            variant: 'secondary',
                            className: 'mt-4',
                        })}>
                        <ChevronLeft className='h-3 w-3 mr-1.5' />
                        Back
                    </Link>
                </div>
            </div>
            <ChatInput isDisabled/>
        </div>
    }

    
    return (
        <ChatContextProvider fileId={fileId}>
        <div className="relative min-h-full bg-zinc-50 flex divide-zinc-200 flex-col justify-between gap-2">
            <div className="flex-1 justify-between flex flex-col mb-28">
                <Messages ></Messages>
            </div>
            <ChatInput/>
        </div>
        </ChatContextProvider>
    );
}

export default ChatWrapper;