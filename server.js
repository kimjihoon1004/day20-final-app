const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static("public"));

// GET /api/exercises - 등록된 전체 운동 목록 조회
app.get("/api/exercises", async (req, res) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
});

// GET /api/exercises/:id - 특정 운동 상세 조회
app.get("/api/exercises/:id", async (req, res) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found" });
  }
  res.json(exercise);
});

// POST /api/exercises - 새 운동 등록
app.post("/api/exercises", async (req, res) => {
  const { name, reps } = req.body;
  const exercise = await prisma.exercise.create({
    data: { name, reps },
  });
  res.status(201).json(exercise);
});

// PUT /api/exercises/:id - 운동 정보 수정 (이름, 세트/횟수 등)
app.put("/api/exercises/:id", async (req, res) => {
  const { name, reps } = req.body;
  const exercise = await prisma.exercise.update({
    where: { id: Number(req.params.id) },
    data: { name, reps },
  });
  res.json(exercise);
});

// PUT /api/exercises/:id/toggle - 완료 여부 체크/해제
app.put("/api/exercises/:id/toggle", async (req, res) => {
  const { isDone } = req.body;
  const exercise = await prisma.exercise.update({
    where: { id: Number(req.params.id) },
    data: { isDone },
  });
  res.json(exercise);
});

// DELETE /api/exercises/:id - 운동 삭제
app.delete("/api/exercises/:id", async (req, res) => {
  await prisma.exercise.delete({
    where: { id: Number(req.params.id) },
  });
  res.status(204).end();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
