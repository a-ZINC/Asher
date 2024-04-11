"use client"
import {Document,Page,pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronDown, ChevronUp, Ghost, Loader2, RotateCw, Search } from 'lucide-react';
import { useToast } from './use-toast';
import {useResizeDetector} from 'react-resize-detector';
import { Button } from './button';
import { Input } from './input';
import { ChangeEvent, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import SimpleBar from 'simplebar-react'
import PdfFullScreen from './PdfFullScreen';
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
    const [scale,setscale]=useState<number>(1);
    const [rotate,setrotate]=useState<number>(0);
    const [renderscale,setrenderscale]=useState<number|null>(null);
    const isLoading=renderscale!==scale
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
                <div className='space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='gap-1.5' aria-label='zoom' variant='ghost'>
                                <Search className='h-4 w-4'/>
                                {scale*100}%<ChevronDown className='h-3 w-3 opacity-50'/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={()=>setscale(0.5)}>
                                50%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={()=>setscale(0.75)}>
                                75%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={()=>setscale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={()=>setscale(1.5)}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={()=>setscale(2)}>
                                200%
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                    <Button aria-label='rotate 90 degree' variant='ghost' onClick={()=>setrotate((prev)=>prev+90)}>
                        <RotateCw className='h-4 w-4'/>
                    </Button>
                    <PdfFullScreen url={url}/>
                </div>
            </div>
            <div className='flex-1 w-full max-h-screen'>
                <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
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
                    {
                        isLoading && renderscale ?(
                            <Page key={'@'+ renderscale} width={width?width:1} pageNumber={currpage} className='mx-auto ' scale={scale} rotate={rotate}/>
                        ):
                        (null)
                    }
                    <Page key={"@"+scale} width={width?width:1} pageNumber={currpage} loading={
                        <div className='flex justify-center'>
                        <Loader2 className='my-24 h-6 w-6 animate-spin' />
                      </div>
                    } className={`${isLoading?'hidden':'block'}`} scale={scale} rotate={rotate} onRenderSuccess={()=>setrenderscale(scale)}/>
                </Document>
                </div>
                </SimpleBar>
            </div>
        </div>
    );
}

export default PdfRenderer;