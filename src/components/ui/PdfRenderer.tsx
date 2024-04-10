"use client"
import {Document,Page,pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronDown, ChevronUp, Ghost, Loader2 } from 'lucide-react';
import { useToast } from './use-toast';
import {useResizeDetector} from 'react-resize-detector';
import { Button } from './button';
import { Input } from './input';
import { ChangeEvent, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
interface PdfRendererProps{
    url:string,
}

const PdfRenderer = ({url}:PdfRendererProps) => {
    const {toast}=useToast();
    const {width,ref}=useResizeDetector();
    const [numPages,setnumPages]=useState<number>();
    const [currpage,setcurrpage]=useState<number>(1);
    const [inputpage,setinputpage]=useState<string>('1');
    const prevPageHandler=()=>{
        if(currpage===1) return;
        setcurrpage(currpage-1);
        setinputpage(String(currpage-1));
    }
    const nextPageHandler=()=>{
        if(currpage===numPages) return;
        setcurrpage(currpage+1);
        setinputpage(String(currpage+1));
    }
    const inputPageHandler=(e:ChangeEvent<HTMLInputElement>)=>{
        //console.log(e)
        //console.log(e.target);
        if(isNaN(Number(e.target.value))){
            e.preventDefault();
            return;
        }
        if(numPages && Number(e.target.value)>numPages){
            e.preventDefault();
            setinputpage(String(numPages))
            return;
        }
        
     
        setinputpage(e.target.value)
        

    }
    const keydownhandler=(e:React.KeyboardEvent<HTMLDivElement>)=>{
        console.log(e);
        console.log(inputpage);
        if(e.code==='Enter'){
            if(inputpage===""){ 
                setinputpage('1');
                setcurrpage(1);
                return;
            }

            setcurrpage(Number(inputpage));
        }
    }
    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center
        ">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button aria-label='previous-page' variant='ghost' onClick={()=>prevPageHandler()} disabled={currpage===1}>
                        <ChevronDown className='h-4 w-4'/>
                    </Button>
                    <div className='flex items-center gap-1.5'>
                        <input type='text' className='w-12 h-8' value={inputpage} onChange={(e)=>inputPageHandler(e)} onKeyDown={(e)=>keydownhandler(e)}  />
                        <p className='text-zinc-700 text-sm space-x-1'>
                            <span>/</span>
                            <span>{numPages ?? 'x'}</span>
                        </p>
                    </div>
                    <Button aria-label='previous-page' variant='ghost' onClick={()=>nextPageHandler()} disabled={currpage===numPages}>
                        <ChevronUp className='h-4 w-4'/>
                    </Button>
                </div>
            </div>
            <div className='flex-1 w-full max-h-screen'>
                <div ref={ref}>
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
                    <Page width={width?width:1} pageNumber={currpage} loading={
                        <div className='flex justify-center'>
                        <Loader2 className='my-24 h-6 w-6 animate-spin' />
                      </div>
                    } className='mx-auto'/>
                </Document>
                </div>
            </div>
        </div>
    );
}

export default PdfRenderer;