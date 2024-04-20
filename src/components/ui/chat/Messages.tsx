import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { trpc } from "@/app/_trpc/client";
import { INFINITELIMIT } from "@/config/infinite-query";
import { keepPreviousData } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useIntersection,useInViewport } from '@mantine/hooks'

interface MsgProps{
    fileId:string,
}
const Messages = ({fileId}:MsgProps) => {
    const {isLoading,isPending,message,isSuccess,backupmessage}=useContext(ChatContext);
    const messages=trpc.getFileMessages.useInfiniteQuery({
            fileId,
            limit:INFINITELIMIT,
        },
        {
            getNextPageParam:(prev)=>{ return prev?.nextcursor},
        }
    );
    const mess = messages?.data?.pages.flatMap(
        (page) => page.message
      );
      const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: 'loading-message',
        isUserMessage: false,
        text: (
          <span className='flex h-full items-center justify-center'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </span>
        ),
      }
      const pendingMessage = {
        createdAt: new Date().toISOString(),
        id: 'pending-message',
        isUserMessage: true,
        text: backupmessage,
      };

      const combinedmessage=[
        ...(isLoading?[loadingMessage]:[]),
        ...(mess ?? [])

      ]

      const parentRef=useRef<HTMLDivElement>(null);
      const { ref, entry } = useIntersection({
        root:parentRef.current,
        threshold:1
      })

      useEffect(()=>{
        if(entry?.isIntersecting){
            console.log('hello')
            messages.fetchNextPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },[entry,messages.fetchNextPage]);

      console.log(messages.data);
    return (
        <div className='w-full flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
            {
                combinedmessage && combinedmessage.length>0 ?(
                    combinedmessage.map((msg,i)=>{
                        const isSameUserMsg=combinedmessage[i]?.isUserMessage===combinedmessage[i-1]?.isUserMessage;

                        if(i===combinedmessage.length-1){
                            return (
                                <Message
                                    ref={ref}
                                    isSameUserMsg={isSameUserMsg}
                                    msg={msg}
                                    key={msg.id}                                
                                />

                            )
                        }
                        else{
                            return (
                                <Message
                                    isSameUserMsg={isSameUserMsg}
                                    msg={msg}
                                    key={msg.id}                                
                                />

                            )
                        }

})
                ):messages.isLoading?(
                    <div className='w-full flex flex-col gap-2'>
                        <Skeleton className='h-16' />
                        <Skeleton className='h-16' />
                        <Skeleton className='h-16' />
                        <Skeleton className='h-16' />
                    </div>
                ):(
                    <div className='flex-1 flex flex-col items-center justify-center gap-2'>
                        <MessageSquare className='h-8 w-8 text-blue-500' />
                        <h3 className='font-semibold text-xl'>
                            You&apos;re all set!
                        </h3>
                        <p className='text-zinc-500 text-sm'>
                            Ask your first question to get started.
                        </p>
                    </div>
                )
            }
        </div>
    );
}

export default Messages;