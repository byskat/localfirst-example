import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  selectDashboardSchema,
  selectProjectSchema,
  selectTodoSchema,
  selectUsersSchema,
  selectWidgetSchema,
} from "@/db/schema";
import { trpc } from "@/lib/trpc-client";

export const usersCollection = createCollection(
  electricCollectionOptions({
    id: `users`,
    shapeOptions: {
      url: new URL(
        `/api/users`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectUsersSchema,
    getKey: (item) => item.id,
  })
);
export const projectCollection = createCollection(
  electricCollectionOptions({
    id: `projects`,
    shapeOptions: {
      url: new URL(
        `/api/projects`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectProjectSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newProject } = transaction.mutations[0];
      const result = await trpc.projects.create.mutate({
        name: newProject.name,
        description: newProject.description,
        owner_id: newProject.owner_id,
        shared_user_ids: newProject.shared_user_ids,
      });

      return { txid: result.txid, item: result.item };
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedProject } = transaction.mutations[0];
      const result = await trpc.projects.update.mutate({
        id: updatedProject.id,
        data: {
          name: updatedProject.name,
          description: updatedProject.description,
          shared_user_ids: updatedProject.shared_user_ids,
        },
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedProject } = transaction.mutations[0];
      const result = await trpc.projects.delete.mutate({
        id: deletedProject.id,
      });

      return { txid: result.txid };
    },
  })
);

export const todoCollection = createCollection(
  electricCollectionOptions({
    id: `todos`,
    shapeOptions: {
      url: new URL(
        `/api/todos`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        // Parse timestamp columns into JavaScript Date objects
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectTodoSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newTodo } = transaction.mutations[0];
      const result = await trpc.todos.create.mutate({
        user_id: newTodo.user_id,
        text: newTodo.text,
        completed: newTodo.completed,
        project_id: newTodo.project_id,
        user_ids: newTodo.user_ids,
      });

      return { txid: result.txid };
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedTodo } = transaction.mutations[0];
      const result = await trpc.todos.update.mutate({
        id: updatedTodo.id,
        data: {
          text: updatedTodo.text,
          completed: updatedTodo.completed,
        },
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedTodo } = transaction.mutations[0];
      const result = await trpc.todos.delete.mutate({
        id: deletedTodo.id,
      });

      return { txid: result.txid };
    },
  })
);

export const dashboardsCollection = createCollection(
  electricCollectionOptions({
    id: `dashboards`,
    shapeOptions: {
      url: new URL(
        `/api/dashboards`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectDashboardSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newDashboard } = transaction.mutations[0];
      const result = await trpc.dashboards.create.mutate({
        name: newDashboard.name,
        description: newDashboard.description,
        owner_id: newDashboard.owner_id,
        shared_user_ids: newDashboard.shared_user_ids,
        editor_ids: newDashboard.editor_ids,
      });

      return { txid: result.txid, item: result.item };
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedDashboard } = transaction.mutations[0];
      const result = await trpc.dashboards.update.mutate({
        id: updatedDashboard.id,
        data: {
          name: updatedDashboard.name,
          description: updatedDashboard.description,
          shared_user_ids: updatedDashboard.shared_user_ids,
          editor_ids: updatedDashboard.editor_ids,
        },
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedDashboard } = transaction.mutations[0];
      const result = await trpc.dashboards.delete.mutate({
        id: deletedDashboard.id,
      });

      return { txid: result.txid };
    },
  })
);

export const widgetsCollection = createCollection(
  electricCollectionOptions({
    id: `widgets`,
    shapeOptions: {
      url: new URL(
        `/api/dashboard-widgets`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:5173`
      ).toString(),
      parser: {
        timestamptz: (date: string) => {
          return new Date(date);
        },
      },
    },
    schema: selectWidgetSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newWidget } = transaction.mutations[0];
      const result = await trpc.widgets.create.mutate({
        dashboard_id: newWidget.dashboard_id,
        type: newWidget.type,
        title: newWidget.title,
        config: newWidget.config,
        layout: newWidget.layout,
        data_source: newWidget.data_source,
      });

      return { txid: result.txid, item: result.item };
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedWidget } = transaction.mutations[0];
      const result = await trpc.widgets.update.mutate({
        id: updatedWidget.id,
        data: {
          type: updatedWidget.type,
          title: updatedWidget.title,
          config: updatedWidget.config,
          layout: updatedWidget.layout,
          data_source: updatedWidget.data_source,
        },
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedWidget } = transaction.mutations[0];
      const result = await trpc.widgets.delete.mutate({
        id: deletedWidget.id,
      });

      return { txid: result.txid };
    },
  })
);
