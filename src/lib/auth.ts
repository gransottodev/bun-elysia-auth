import { db } from "@/database/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization } from "better-auth/plugins";
import { emailService } from "@/services/email";
import { env } from "@/env";
import { schema } from "@/database/schema";

export const auth = betterAuth({
  basePath: "/auth",
  plugins: [openAPI(), organization()],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      try {
        await emailService.sendVerificationEmail(user.email, url);
        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      try {
        await emailService.sendPasswordResetEmail(user.email, url);
        console.log(`Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [env.APP_URL],
});
