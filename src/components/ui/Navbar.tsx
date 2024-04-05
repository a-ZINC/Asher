import Link from "next/link";
import { buttonVariants } from "./button";
import { LoginLink,RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";


const Navbar = () => {
    return (
        <nav className="h-14 bg-white/75 backdrop-blur-lg transition-all sticky inset-x-0 top-0 z-30 w-full border-b border-gray-200 ">
            <div className="mx-auto w-full max-w-screen-xl px-2.5 md:px-20">
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link
                        href={"/"}
                        className='flex z-40 font-bold text-lg'
                    ><span>asher.</span></Link>

                    <div className="hidden sm:flex items-center space-x-4 ">
                        <>
                            <Link
                                href={'/pricing'}
                                className={buttonVariants({
                                    size:"sm",
                                    variant: 'ghost'
                                })}>
                                Pricing
                            </Link>
                            <LoginLink
                                
                                className={buttonVariants({
                                    size:"sm",
                                    variant: 'ghost'
                                })}>
                                Login
                            </LoginLink>
                            <RegisterLink
                                
                                className={buttonVariants({
                                    size:"sm",
                                })}>
                                Get started{' '}
                                <ArrowRight className='ml-1.5 h-5 w-5' />
                            </RegisterLink>
                        </>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;