import z from "zod";

export const commonPageQuery = z.object({
  page: z.coerce.number().min(0).default(0).catch(0),
  size: z.coerce.number().min(10).default(20).catch(30),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
});
