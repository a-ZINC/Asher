import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/ui/Dashboard";

const Page = async() => {
    const {getUser}=getKindeServerSession();
    const user=await getUser();

    if(!user || !user.id) redirect('/log-in');
    const userdb=await db.user.findFirst({
        where:{
            id:user.id
        }
    })
    console.log(userdb)
    if(!userdb) redirect('/auth-callback?origin=dashboard');


    return (
        <Dashboard/>
    );
}

export default Page;