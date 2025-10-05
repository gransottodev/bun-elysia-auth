import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  RESEND_API_KEY: z.string().min(1),
  FROM_EMAIL: z.string().email(),
  APP_URL: z.string().url(),
});

export const env = envSchema.parse(Bun.env);
