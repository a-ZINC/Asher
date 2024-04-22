"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Button } from "./button";
import Dropzone from 'react-dropzone';
import { Cloud,File,Loader2 } from "lucide-react";
import { Progress } from "./progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast"
import { trpc } from "@/app/_trpc/client";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
const UploadDropzone=({isSubscribed}:{isSubscribed:boolean})=>{
    const router=useRouter()
    const {toast}=useToast()
    const [uploadingfile,setuploadingfile]=useState<Boolean>(false)
    const [uploadprogress,setuploadprogress]=useState<number>(0);
    const {startUpload}=useUploadThing(isSubscribed? "proplanuploader":"freeplanuploader")
    const progresspercentage=()=>{
        setuploadprogress(0);
        const intervalid=setInterval(()=>{
            setuploadprogress((prev)=>{
                if(prev>=95){
                    clearInterval(intervalid);
                    return prev
                }
                return prev+5
            });

        },500);
        return intervalid;
    }
    const fileData=trpc.getFile.useMutation({
        retry:true,
        retryDelay:500
    });
    useEffect(()=>{
        if(fileData.isSuccess){
            console.log(fileData)
            router.push(`/dashboard/${fileData?.data?.id}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[fileData.isSuccess])
    return(
        <Dropzone onDrop={async(acceptedFiles) => {
            setuploadingfile(true);
            const interval=progresspercentage();
            const res=await startUpload(acceptedFiles);
            console.log(res)
            if(!res){
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Try again later!",
                  })
            }
            else{
            
            const key=res[0]?.key;
            if(!key){
                toast({
                    variant: "destructive",
                    title: "Uh oh! File upload failed.",
                    description: "Try again later!",
                  })
            }
           
            clearInterval(interval);
            setuploadprogress(100);
            fileData.mutate({key})}
        }} multiple={false}>
        {({getRootProps, getInputProps, acceptedFiles}) => (
            <section>
            <div {...getRootProps()} className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
            <div className='flex items-center justify-center h-full w-full'>
            <label
              htmlFor='dropzone-file'
              className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                <input {...getInputProps()}
                   type='file'
                   id='dropzone-file'
                   className="hidden"/>
                 <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                    <p className='mb-2 text-sm text-zinc-700'>
                    <span className='font-semibold'>
                        Click to upload
                    </span>{' '}
                    or drag and drop
                    </p>
                    <p className='text-xs text-zinc-500'>
                    PDF {isSubscribed?"(up to 16MB)":"(up to 4MB)"}
                    </p>
                  </div>

                  {acceptedFiles && acceptedFiles[0] ? (
                    <div className='max-w-xs mb-2 bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                    <div className='px-3 py-2 h-full grid place-items-center'>
                        <File className='h-4 w-4 text-blue-500' />
                    </div>
                    <div className='px-3 py-2 h-full text-sm truncate'>
                        {acceptedFiles[0].name}
                    </div>
                    </div>
                    ) : null}
                   {
                    uploadingfile?(
                        <div className="w-3/4"><Progress value={uploadprogress} />
                        {uploadprogress===100 ?(
                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                            <Loader2 className='h-3 w-3 animate-spin' />
                            Redirecting...
                          </div>
                        ):(null)}
                        </div>
                    ):(
                        null
                    )
                   }
                   
              </label>
            </div>
            </div>
            </section>
        )}
        </Dropzone>
    );
}
const Uploadbtn = ({isSubscribed}:{isSubscribed:boolean}) => {
    const [open,setIsopen]=useState<boolean>(false);
    return (
        <Dialog
            open={open}
            onOpenChange={()=>{
                setIsopen(!open)
            }}    
        >
            <DialogTrigger asChild onClick={()=>setIsopen(true)}>
                <Button>Upload File</Button>
            </DialogTrigger>
            <DialogContent><UploadDropzone isSubscribed={isSubscribed}/></DialogContent>
        </Dialog>
    );
}

export default Uploadbtn;