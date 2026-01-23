import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createWidgetSchema,
  dashboardWidgetsTable,
  dashboardsTable,
  updateWidgetSchema,
} from "@/db/schema";
import { authedProcedure, generateTxId, router } from "@/lib/trpc";

export const widgetsRouter = router({
  create: authedProcedure
    .input(createWidgetSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        // Check if user has edit permission on the dashboard
        const [dashboard] = await tx
          .select()
          .from(dashboardsTable)
          .where(eq(dashboardsTable.id, input.dashboard_id))
          .limit(1);

        if (!dashboard) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Dashboard not found`,
          });
        }

        const canEdit =
          dashboard.owner_id === ctx.session.user.id ||
          dashboard.editor_ids.includes(ctx.session.user.id);

        if (!canEdit) {
          throw new TRPCError({
            code: `FORBIDDEN`,
            message: `You do not have permission to edit this dashboard`,
          });
        }

        const txid = await generateTxId(tx);
        const [newItem] = await tx
          .insert(dashboardWidgetsTable)
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
        data: updateWidgetSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        // Get widget with dashboard info
        const [widget] = await tx
          .select({
            widget: dashboardWidgetsTable,
            dashboard: dashboardsTable,
          })
          .from(dashboardWidgetsTable)
          .innerJoin(
            dashboardsTable,
            eq(dashboardWidgetsTable.dashboard_id, dashboardsTable.id)
          )
          .where(eq(dashboardWidgetsTable.id, input.id))
          .limit(1);

        if (!widget) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Widget not found`,
          });
        }

        const canEdit =
          widget.dashboard.owner_id === ctx.session.user.id ||
          widget.dashboard.editor_ids.includes(ctx.session.user.id);

        if (!canEdit) {
          throw new TRPCError({
            code: `FORBIDDEN`,
            message: `You do not have permission to edit this widget`,
          });
        }

        const txid = await generateTxId(tx);
        const [updatedItem] = await tx
          .update(dashboardWidgetsTable)
          .set(input.data)
          .where(eq(dashboardWidgetsTable.id, input.id))
          .returning();

        return { item: updatedItem, txid };
      });

      return result;
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.transaction(async (tx) => {
        // Get widget with dashboard info
        const [widget] = await tx
          .select({
            widget: dashboardWidgetsTable,
            dashboard: dashboardsTable,
          })
          .from(dashboardWidgetsTable)
          .innerJoin(
            dashboardsTable,
            eq(dashboardWidgetsTable.dashboard_id, dashboardsTable.id)
          )
          .where(eq(dashboardWidgetsTable.id, input.id))
          .limit(1);

        if (!widget) {
          throw new TRPCError({
            code: `NOT_FOUND`,
            message: `Widget not found`,
          });
        }

        const canEdit =
          widget.dashboard.owner_id === ctx.session.user.id ||
          widget.dashboard.editor_ids.includes(ctx.session.user.id);

        if (!canEdit) {
          throw new TRPCError({
            code: `FORBIDDEN`,
            message: `You do not have permission to delete this widget`,
          });
        }

        const txid = await generateTxId(tx);
        const [deletedItem] = await tx
          .delete(dashboardWidgetsTable)
          .where(eq(dashboardWidgetsTable.id, input.id))
          .returning();

        return { item: deletedItem, txid };
      });

      return result;
    }),
});
