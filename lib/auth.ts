import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

import { GOOGLE_CLASSROOM_SCOPES } from "@/lib/google-classroom"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

            // Better Auth already adds openid, email and profile for Google.
            scope: [...GOOGLE_CLASSROOM_SCOPES],

            accessType: "offline",
            prompt: "select_account consent",
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            allowDifferentEmails: true,
        },
    },
})
