import { Router, type IRouter } from "express";
import { db, tournamentsTable } from "@workspace/db";
import { and, lte, gte, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/tournament/current", async (req, res) => {
  const now = new Date();
  const [tournament] = await db
    .select()
    .from(tournamentsTable)
    .where(
      and(
        lte(tournamentsTable.startTime, now),
        gte(tournamentsTable.endTime, now),
      ),
    )
    .orderBy(desc(tournamentsTable.createdAt))
    .limit(1);

  if (!tournament) {
    const [upcoming] = await db
      .select()
      .from(tournamentsTable)
      .where(gte(tournamentsTable.startTime, now))
      .orderBy(tournamentsTable.startTime)
      .limit(1);

    if (upcoming) {
      res.json({ status: "upcoming", tournament: upcoming });
    } else {
      res.json({ status: "none", tournament: null });
    }
    return;
  }

  res.json({ status: "active", tournament });
});

export default router;
