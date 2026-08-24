import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

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

            scope: [
                "openid",
                "email",
                "profile",
                "https://www.googleapis.com/auth/classroom.courses.readonly",
                "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
            ],

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