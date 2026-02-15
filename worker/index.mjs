import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export const whatsappQueue = new Queue("whatsapp", { connection });

async function enqueueQueuedMessages() {
  const queued = await prisma.whatsappMessage.findMany({
    where: { status: "queued" },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  for (const msg of queued) {
    await whatsappQueue.add("send", { id: msg.id }, { removeOnComplete: true, removeOnFail: true });
  }
}

new Worker(
  "whatsapp",
  async (job) => {
    const id = job.data.id;
    const msg = await prisma.whatsappMessage.findUnique({ where: { id } });
    if (!msg) return;

    await prisma.whatsappMessage.update({
      where: { id },
      data: { status: "sent", sentAt: new Date(), error: null },
    });

    console.log("[whatsapp] sent", msg.toPhone, msg.template);
  },
  { connection }
);

console.log("Worker started. Polling outbox every 5s...");
setInterval(() => {
  enqueueQueuedMessages().catch((e) => console.error("enqueue error", e));
}, 5000);
