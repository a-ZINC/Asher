import BillingForm from "@/components/ui/BillingForm"
import { getUserSubscriptionPlan } from "@/lib/stripe"

const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return <BillingForm subscriptionPlan={subscriptionPlan} /> 
}

export default Page;