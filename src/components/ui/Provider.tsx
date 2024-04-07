"use client";
import { trpc } from "@/app/_trpc/client";
import { ReactNode, useState } from "react";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
const Provider = ({children}:{children:ReactNode}) => {
    const [queryClient] = useState(
        () =>
          new QueryClient({})
      );
      const [trpcClient] = useState(() =>
        trpc.createClient({
          links: [
            httpBatchLink({
              url:'http://localhost:3000/api/trpc'
            }),
          ],
        })
      );
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
    );
}

export default Provider;