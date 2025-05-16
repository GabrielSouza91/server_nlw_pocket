import z from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createGoalCompletion } from "../../functions/create-goal-completion";
import { getWeekPendingGoals } from "../../functions/get-week-pending-goals";

export const getPendingGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/pending-goals", async () => {
    const { pedingGoals } = await getWeekPendingGoals();

    return { pedingGoals };
  });
};
