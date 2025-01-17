import dayjs from "dayjs";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { count, and, gte, lte, eq, sql } from "drizzle-orm";

interface CreateCompletionRequest {
  goalId: string;
}

const firstDayOfWeek = dayjs().startOf("week").toDate();
const lastDayOfWeek = dayjs().endOf("week").toDate();

export async function createGoalCompletion({
  goalId,
}: CreateCompletionRequest) {
  const goalCompletinCounts = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createAt, firstDayOfWeek),
          lte(goalCompletions.createAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )

      .groupBy(goalCompletions.goalId)
  );

  const result = await db
    .with(goalCompletinCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalCompletinCounts.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goals)
    .leftJoin(goalCompletinCounts, eq(goalCompletinCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1);

  const { completionCount, desiredWeeklyFrequency } = result[0];

  console.log([completionCount, desiredWeeklyFrequency]);

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal already completed this week!");
  }

  const insertResult = await db
    .insert(goalCompletions)

    .values({ goalId })
    .returning();
  const goalCompletion = insertResult[0];

  return {
    goalCompletion,
  };
}
