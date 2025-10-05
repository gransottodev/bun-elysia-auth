import { auth } from "@/lib/auth";
import Elysia, { status } from "elysia";
import { UnauthorizedError } from "../errors/unauthorized";
import openapi from "@elysiajs/openapi";

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          return status(401, { error: "Unauthorized" });
        }

        return session;
      },
    },
  })
  .derive(({ request: { headers } }) => {
    return {
      getUser: async () => {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          throw new UnauthorizedError();
        }

        return {
          user: session.user,
        };
      },
    };
  });
