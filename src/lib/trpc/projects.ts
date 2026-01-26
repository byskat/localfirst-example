import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createProjectSchema,
  projectsTable,
  updateProjectSchema,
} from "@/db/schema";
import { authedProcedure, generateTxId, router } from "@/lib/trpc";

export const projectsRouter = router({
  create: authedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.owner_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: `FORBIDDEN`,
          message: `You can only create projects you own`,
        });
      }

      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [newItem] = await tx
          .insert(projectsTable)
          .values(input)
          .returning();
        return { item: newItem, txid };
      });

      return result;
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateProjectSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        // First, check if user has permission (owner or in shared_user_ids)
        const [project] = await tx
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, input.id));

        if (!project) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Project not found`,
          });
        }

        const isOwner = project.owner_id === ctx.session.user.id;
        const hasEditPermission = project.shared_user_ids.includes(
          ctx.session.user.id
        );

        if (!isOwner && !hasEditPermission) {
          throw new TRPCError({
            code: `FORBIDDEN`,
            message: `You do not have permission to update this project`,
          });
        }

        const [updatedItem] = await tx
          .update(projectsTable)
          .set(input.data)
          .where(eq(projectsTable.id, input.id))
          .returning();

        return { item: updatedItem, txid };
      });

      return result;
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [deletedItem] = await tx
          .delete(projectsTable)
          .where(
            and(
              eq(projectsTable.id, input.id),
              eq(projectsTable.owner_id, ctx.session.user.id)
            )
          )
          .returning();

        if (!deletedItem) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Project not found or you do not have permission to delete it`,
          });
        }

        return { item: deletedItem, txid };
      });

      return result;
    }),
});
