import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { subscribeEmail } = await import("./newsletter.server");
    return subscribeEmail(data.email);
  });
