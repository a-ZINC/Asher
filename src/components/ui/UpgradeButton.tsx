"use client"
import { ArrowRight } from "lucide-react";
import { Button } from "./button";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {

    const stripemutation=trpc.createStripeSession.useMutation(
       {
        onSuccess: ({url}) => {
            
            window.location.href = url ?? "/dashboard/billing"
          }
       }
    )
 
    return (
        <Button className='w-full' onClick={()=>stripemutation.mutate()}>
        Upgrade now <ArrowRight className='h-5 w-5 ml-1.5' />
      </Button>
    );
}

export default UpgradeButton;