import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server"

export const config={
    matcher:["/dasboard/:path*","/auth-callback"]
}

export default authMiddleware;