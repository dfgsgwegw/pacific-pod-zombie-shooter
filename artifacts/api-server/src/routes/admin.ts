import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/admin/users", requireAdmin, async (req, res) => {
  const { discordUsername, password, isAdmin } = req.body as {
    discordUsername?: string;
    password?: string;
    isAdmin?: boolean;
  };

  if (!discordUsername || !password) {
    res.status(400).json({ error: "discordUsername and password are required" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [user] = await db
      .insert(usersTable)
      .values({ discordUsername, passwordHash, isAdmin: isAdmin ?? false })
      .returning({ id: usersTable.id, discordUsername: usersTable.discordUsername });

    res.json({ ok: true, user });
  } catch {
    res.status(409).json({ error: "Username already exists" });
  }
});

router.get("/admin/users", requireAdmin, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      discordUsername: usersTable.discordUsername,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json({ users });
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/tournament", requireAdmin, async (req, res) => {
  const { name, startTime, endTime } = req.body as {
    name?: string;
    startTime?: string;
    endTime?: string;
  };

  if (!name || !startTime || !endTime) {
    res.status(400).json({ error: "name, startTime, and endTime are required" });
    return;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    res.status(400).json({ error: "Invalid start/end times" });
    return;
  }

  const [tournament] = await db
    .insert(tournamentsTable)
    .values({ name, startTime: start, endTime: end })
    .returning();

  res.json({ ok: true, tournament });
});

router.get("/admin/tournaments", requireAdmin, async (_req, res) => {
  const tournaments = await db
    .select()
    .from(tournamentsTable)
    .orderBy(tournamentsTable.startTime);

  res.json({ tournaments });
});

export default router;
