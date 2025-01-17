import fastify from "fastify";
import { createGoal } from "../functions/create-goal";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { getWeekPendingGoals } from "../functions/get-week-pending-goals";
import { createGoalCompletion } from "../functions/create-goal-completion";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/pending-goals", async () => {
  const { pedingGoals } = await getWeekPendingGoals();

  return { pedingGoals };
});

app.post(
  "/goals",
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async (request) => {
    const { desiredWeeklyFrequency, title } = request.body;

    await createGoal({
      title,
      desiredWeeklyFrequency,
    });
  }
);

app.post(
  "/completions",
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async (request) => {
    const { goalId } = request.body;

    await createGoalCompletion({
      goalId,
    });
  }
);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server listening on port 3333");
  });
