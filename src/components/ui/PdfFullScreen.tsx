"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { Expand } from "lucide-react";
import SimpleBar from "simplebar-react";
import {Document,Page,pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronDown, ChevronUp, Ghost, Loader2, RotateCw, Search } from 'lucide-react';
import { useToast } from './use-toast';
import {useResizeDetector} from 'react-resize-detector';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
interface PdfRendererProps{
    url:string,
}

const PdfFullScreen = ({url}:PdfRendererProps) => {
    const {width,ref}=useResizeDetector();
    const [open,setopen]=useState<boolean>(false);
    const {toast}=useToast();
    const [numPages,setnumPages]=useState<number>();
    const [scale,setscale]=useState<number>(1);
    const [rotate,setrotate]=useState<number>(0);
    const [currpage,setcurrpage]=useState<number>(1);
    return (
        <Dialog open={open} onOpenChange={(v)=>{if(!v){setopen(v)}}}>
            <DialogTrigger asChild onClick={()=>setopen(true)}>
                <Button variant='ghost' aria-label='fullscreen' className="gap-1.5" >
                    <Expand className="h-4 w-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-8xl w-full">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
                <div ref={ref} className='mx-auto'>
                <Document file={url} className='max-h-full'
                    loading={
                        <div className='flex justify-center'>
                          <Loader2 className='my-24 h-6 w-6 animate-spin' />
                        </div>
                      }
                    onLoadError={() => {
                        toast({
                          title: 'Error loading PDF',
                          description: 'Please try again later',
                          variant: 'destructive',
                        })
                    }}
                    onLoadSuccess={({numPages})=>{
                        setnumPages(numPages)
                    }}
                >
                    {new Array(numPages).fill(0).map((_,i)=>(
                         <Page key={i} width={width?width:1} pageNumber={i+1}/>
                    ))}
                </Document>
                </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    );
}

export default PdfFullScreen;