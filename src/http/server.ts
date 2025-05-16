import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { createGoalRoute } from "./routes/create-goal";
import { getPendingGoalRoute } from "./routes/get-pending-goal";
import { createCompletionGoalRoute } from "./routes/create-completion";
import { getWeekSummaryRoute } from "./routes/get-week-pending";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "*",
});

app.register(createGoalRoute);
app.register(createCompletionGoalRoute);
app.register(getPendingGoalRoute);
app.register(getWeekSummaryRoute);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server listening on port 3333");
  });
