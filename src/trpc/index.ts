
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import {z} from 'zod'
import { INFINITELIMIT } from '@/config/infinite-query';
export const appRouter = router({
    authCallback: publicProcedure.query(async()=>{
        const {getUser}=getKindeServerSession();
        const user=await getUser();
        
        if(!user?.id || !user?.email) throw new TRPCError({code: "UNAUTHORIZED"})
        const dbuser=await db.user.findFirst({
            where:{
                id:user.id
            }
        })
        if(!dbuser){
            await db.user.create({
                data:{
                    id:user.id,
                    email:user.email
                }
            })
        }
        return {success:true}
    }),
    getUserFile: privateProcedure.query(async(req)=>{
        const {ctx}=req;
        const {userId,user}=ctx;

        return await db.file.findMany({
            where:{
                userId:userId
            }
        })
    }),
    deleteFile: privateProcedure.input(z.object({id:z.string()}))
    .mutation(async({ctx,input})=>{
        console.log(input)
        const {userId}=ctx;

        const file=await db.file.findFirst({
            where:{
                id:input.id,
                userId
            }
        });

        if(!file) throw new TRPCError({code: "NOT_FOUND"}) 
        
        await db.file.delete({
            where:{
                id:input.id,
            }
        });
        return file
    }),
    getFile: privateProcedure.input(z.object({key:z.string()}))
    .mutation(async({ctx,input})=>{
        const {userId}=ctx;
        const file=await db.file.findFirst({
            where:{
                key:input.key,
                userId
            }
        });
        if(!file) throw new TRPCError({code:"NOT_FOUND"});
        return file;
    }),
    getFileUploadStatus: privateProcedure.input(z.object({fileId: z.string()}))
    .query(async({input,ctx})=>{
        const file=await db.file.findFirst({
            where: {
                id:input.fileId,
                userId:ctx.userId
            }
        });
        if(!file) return {status: "PENDING" as const}

        return {status:file.uploadStatus}
    }),
    getFileMessages: privateProcedure
        .input(z.object({
            limit:z.number().max(100).min(1).nullish(),
            cursor:z.string().nullish(),
            fileId:z.string()
        }))
        .query(async({input,ctx})=>{
            const limit=input.limit ?? INFINITELIMIT;
            const {cursor,fileId}=input;
            const {userId}=ctx;

            const file=await db.file.findFirst({
                where:{id:fileId}
            });
            if(!file){
                 throw new TRPCError({code:'NOT_FOUND'})
            }

            const message=await db.message.findMany({
                where:{
                    fileId,
                    userId
                },
                take:limit+1,
                cursor:cursor?{id:cursor}:undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                
            });

            let nextcursor:typeof cursor | undefined=undefined;
            if(message.length>limit){
                const lastmsg=message.pop();
                nextcursor=lastmsg?.id
            }

            return {
                message,
                nextcursor
            }

        })


});

export type AppRouter = typeof appRouter;