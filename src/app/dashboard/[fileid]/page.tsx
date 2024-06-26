
import ChatWrapper from "@/components/ui/ChatWrapper";
import PdfRenderer from "@/components/ui/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import { useEffect } from "react";

interface filepageProps{
    params:{
        fileid:string,
    }
}

const File = async({params}:filepageProps) => {
    const {fileid}=params;

    const {getUser}=getKindeServerSession();
    const user=await getUser();

    if(!user || !user.id){
        redirect('/log-in')
    }
    
    const file=await db.file.findFirst({
        where:{
            userId:user.id,
            id:fileid
        }
    });

    if(!file) notFound();
    
    return (
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)] ">
            <div className="mx-auto w-full max-w-8xl grow xl:flex xl:px-2">
            <div className='flex-1 xl:flex'>
            <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                
                <PdfRenderer url={file.url} />
            </div>
            </div>

            <div className='shrink-0 flex-[0.75] border-t border-gray-200 xl:w-96 lg:border-l lg:border-t-0'>
                <ChatWrapper fileId={params.fileid}/>
            </div>
            </div>
        </div>
    );
}

export default File;