import { Send } from "lucide-react";
import { Button } from "../button";
import { Textarea } from "../textarea";

interface ChatInputProps{
    isDisabled?: boolean
}
const ChatInput = ({isDisabled}:ChatInputProps) => {
    return (
        <div className="absolute bottom-0 left-0 w-full">
            <form className="mx-2 flex flex-row gap-3 md:last:mb-6 lg:mx-uto lg:max-w-2xl xl:max-w-3xl">
                <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                    <div className="realtaive flex flex-col w-full flex-grow p-4">
                        <div className="relative xl:translate-y-1/4">
                            <Textarea placeholder="Enter your question..." rows={1} maxRows={2} autoFocus
                            className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "/>
                            <Button className='absolute bottom-[50%] translate-y-1/2 right-[7px] h-9 w-12' aria-label='send message'>
                                <Send className='h-4 w-4'/>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatInput;