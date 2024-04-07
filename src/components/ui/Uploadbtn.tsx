"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Button } from "./button";
const Uploadbtn = () => {
    const [open,setIsopen]=useState<Boolean>(false)
    return (
        <Dialog
            open={open}
            onOpenChange={()=>{
                setIsopen(!open)
            }}    
        >
            <DialogTrigger asChild onClick={()=>setIsopen(true)}>
                <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>example</DialogContent>
        </Dialog>
    );
}

export default Uploadbtn;