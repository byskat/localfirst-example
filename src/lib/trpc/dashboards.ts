import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createDashboardSchema,
  dashboardsTable,
  updateDashboardSchema,
} from "@/db/schema";
import { authedProcedure, generateTxId, router } from "@/lib/trpc";

export const dashboardsRouter = router({
  create: authedProcedure
    .input(createDashboardSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.owner_id !== ctx.session.user.id) {
        throw new TRPCError({
          code: `FORBIDDEN`,
          message: `You can only create dashboards you own`,
        });
      }

      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);
        const [newItem] = await tx
          .insert(dashboardsTable)
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
        data: updateDashboardSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        // First, check if user has permission (owner or in editor_ids)
        const [dashboard] = await tx
          .select()
          .from(dashboardsTable)
          .where(eq(dashboardsTable.id, input.id));

        if (!dashboard) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Dashboard not found`,
          });
        }

        const isOwner = dashboard.owner_id === ctx.session.user.id;
        const hasEditPermission = dashboard.editor_ids.includes(
          ctx.session.user.id
        );

        if (!isOwner && !hasEditPermission) {
          throw new TRPCError({
            code: `FORBIDDEN`,
            message: `You do not have permission to update this dashboard`,
          });
        }

        const [updatedItem] = await tx
          .update(dashboardsTable)
          .set(input.data)
          .where(eq(dashboardsTable.id, input.id))
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
          .delete(dashboardsTable)
          .where(
            and(
              eq(dashboardsTable.id, input.id),
              eq(dashboardsTable.owner_id, ctx.session.user.id)
            )
          )
          .returning();

        if (!deletedItem) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Dashboard not found or you do not have permission to delete it`,
          });
        }

        return { item: deletedItem, txid };
      });

      return result;
    }),
});
