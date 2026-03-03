import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_KEYCLOAK_URL: z.string().url(),
  NEXT_PUBLIC_KEYCLOAK_REALM: z.string().min(1),
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: z.string().min(1),
});

const parsedEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid client environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
