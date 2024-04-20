"use client"
import { useRouter,useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { trpc } from "../_trpc/client";
import { useEffect } from "react";
import { Loader2 } from 'lucide-react'
function Page() {
    const router=useRouter();
    const searchparam=useSearchParams();
    const origin=searchparam.get('origin');
    console.log(origin);
   
    const {data,isLoading,isSuccess,isError,error}=trpc.authCallback.useQuery(undefined,{
        retry: true,
        retryDelay: 500,
    });
    useEffect(()=>{
        if(isSuccess){
            console.log(data)
            router.push(origin?`/${origin}`:"/dashboard")
        }
        if(isError){
            console.log(error);
            if (error.data?.code === 'UNAUTHORIZED') {
                router.push('/sign-in')
              }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isSuccess,isError])
    
    return (
        <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
    );
}

export default function Childpage() {
  return (
    
    <Suspense>
      <Page />
    </Suspense>
  )
}