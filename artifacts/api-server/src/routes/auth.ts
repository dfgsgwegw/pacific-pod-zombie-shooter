import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, tournamentsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signToken } from "../middlewares/auth.js";
import crypto from "crypto";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { discordUsername, password } = req.body as {
    discordUsername?: string;
    password?: string;
  };

  if (!discordUsername || !password) {
    res.status(400).json({ error: "discordUsername and password are required" });
    return;
  }

  const now = new Date();

  // 1. Try admin login: user must exist, be admin, and password must match their personal hash
  const [adminUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordUsername, discordUsername));

  if (adminUser?.isAdmin) {
    const valid = await bcrypt.compare(password, adminUser.passwordHash);
    if (valid) {
      const token = signToken({
        userId: adminUser.id,
        discordUsername: adminUser.discordUsername,
        isAdmin: true,
      });
      res.json({ token, discordUsername: adminUser.discordUsername, isAdmin: true });
      return;
    }
    // Wrong admin password — don't fall through to tournament check for admins
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // 2. Try tournament join password: find any active or upcoming tournament with matching password
  const tournaments = await db.select().from(tournamentsTable);
  const matchingTournament = tournaments.find(
    (t) => t.joinPassword && t.joinPassword === password && new Date(t.endTime) >= now,
  );

  if (!matchingTournament) {
    res.status(401).json({ error: "Invalid tournament password" });
    return;
  }

  // Find or auto-create the player
  let player = adminUser; // might be non-admin existing user with same username
  if (!player) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.discordUsername, discordUsername));
    player = existing[0];
  }

  if (!player) {
    // Auto-create player account (random password hash — they log in via tournament password only)
    const randomHash = await bcrypt.hash(crypto.randomUUID(), 10);
    const [created] = await db
      .insert(usersTable)
      .values({ discordUsername, passwordHash: randomHash, isAdmin: false })
      .returning();
    player = created;
  }

  const token = signToken({
    userId: player.id,
    discordUsername: player.discordUsername,
    isAdmin: false,
  });

  res.json({
    token,
    discordUsername: player.discordUsername,
    isAdmin: false,
    tournamentId: matchingTournament.id,
    tournamentName: matchingTournament.name,
  });
});

export default router;
