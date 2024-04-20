import { format } from "date-fns";
import { Icons } from "../Icons";
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' 
import { forwardRef } from "react";

interface Messageprops{
    id:string,
    createdAt:string,
    isUserMessage:boolean,
    text:JSX.Element | string,
}
interface combinedPropops{
    msg:Messageprops,
    isSameUserMsg:boolean
}

const Message = forwardRef<HTMLDivElement,combinedPropops>(({msg,isSameUserMsg},ref) => {
    return (
        <div className={`flex items-end ${msg.isUserMessage?'justify-end':''} `} ref={ref}>
            <div className={`relative flex h-6 w-6 aspect-square items-center justify-center ${msg.isUserMessage?'order-2 bg-blue-600 rounded-sm':'order-1 bg-zinc-800 rounded-sm'} ${isSameUserMsg?'hidden':''}`}>
            {msg.isUserMessage ? (
                <Icons.user className='fill-zinc-200 text-zinc-200 h-3/4 w-3/4' />
            ) : (
                <Icons.logo className='fill-zinc-300 h-3/4 w-3/4' />
            )}
            </div>
            <div className={`flex flex-col space-y-2 text-base max-w-md mx-2 ${msg.isUserMessage?'order-1 items-end':'order-2 items-start'} ${isSameUserMsg?'hidden':''} `}>
                <div className={`px-4 py-2 rounded-lg inline-block ${msg.isUserMessage? 'bg-blue-600 text-white':'bg-gray-200 text-gray-900'} ${!isSameUserMsg && msg.isUserMessage && 'rounded-br-none'} ${!isSameUserMsg && !msg.isUserMessage && 'rounded-bl-none'}`}>
                    {
                        typeof msg.text==='string'?(
                            <Markdown
                                className={`prose ${msg.isUserMessage?'text-zinc-50':''}`} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {msg.text}
                            </Markdown>
                            
                        ):(
                            msg.text
                        )
                    }
                    {msg.id !== 'loading-message' ? (
                        <div
                            className={`text-xs select-none mt-2 w-full text-right ${msg.isUserMessage?'text-blue-300':'text-zinc-500'}`}>
                            {format(
                            new Date(msg.createdAt),
                            'HH:mm'
                            )}
                        </div>
                        ) : null}

                </div>
            </div>
            
        </div>
    )
}
)

Message.displayName = 'Message'

export default Message;