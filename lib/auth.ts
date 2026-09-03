import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { Resend } from "resend"

import { GOOGLE_RITIMU_SCOPES } from "@/lib/google-classroom"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.BETTER_AUTH_URL].filter((origin): origin is string => Boolean(origin)),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            const resendApiKey = process.env.RESEND_API_KEY
            if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured")

            const resend = new Resend(resendApiKey)
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "Ritimu <onboarding@resend.dev>",
                to: user.email,
                subject: "Redefina sua senha no Ritimu",
                html: `
                    <div style="font-family: Arial, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
                        <h1 style="font-size: 24px; margin: 0 0 12px;">Redefina sua senha</h1>
                        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">Olá, ${user.name || "estudante"}. Clique no botão abaixo para criar uma nova senha para sua conta.</p>
                        <a href="${url}" style="display: inline-block; margin: 16px 0; padding: 13px 22px; border-radius: 999px; background: #111827; color: #ffffff; text-decoration: none; font-weight: 600;">Redefinir senha</a>
                        <p style="font-size: 13px; line-height: 1.5; color: #6b7280;">Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.</p>
                    </div>
                `,
            })
            if (error) throw error
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

            // Better Auth already adds openid, email and profile for Google.
            scope: [...GOOGLE_RITIMU_SCOPES],

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
