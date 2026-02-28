import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  fetchGoogleCalendarEvents,
  fetchGmailMessages,
} from "@/features/external-apis/services/external-api-actions";
import { fetchDailyNote } from "@/features/daily-notes/services/daily-notes-actions";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const session = await auth();
  const userName = session?.user?.name || "User";
  const today = new Date().toISOString().split("T")[0];

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `คุณคือ AI Assistant ของ Daily Management Platform
ชื่อผู้ใช้: ${userName}
วันนี้: ${today}

คุณช่วยสรุปงาน, ตอบคำถามเกี่ยวกับ Calendar Events, Gmail, และ Daily Notes ของผู้ใช้
เมื่อผู้ใช้ถามเกี่ยวกับนัดหมาย/ปฏิทิน ให้เรียก fetchCalendar tool
เมื่อผู้ใช้ถามเกี่ยวกับอีเมล ให้เรียก fetchGmail tool
เมื่อผู้ใช้ถามเกี่ยวกับบันทึก/โน้ต ให้เรียก fetchNotes tool

ตอบเป็นภาษาไทยเป็นหลัก ให้ข้อมูลที่ชัดเจน กระชับ
ถ้าไม่มีข้อมูล ให้แจ้งผู้ใช้ว่าไม่พบข้อมูล แทนที่จะตอบลอยๆ`,
    messages,
    // @ts-expect-error maxSteps is supported under the hood but types are older in this project
    maxSteps: 3,
    tools: {
      fetchCalendar: {
        description:
          "ดึงข้อมูล Calendar Events ของวันนี้จาก Google Calendar ของผู้ใช้",
        inputSchema: z.object({
          date: z
            .string()
            .optional()
            .describe("Date in YYYY-MM-DD format, defaults to today"),
        }),
        execute: async () => {
          try {
            const events = await fetchGoogleCalendarEvents();
            if (!events || events.length === 0) {
              return {
                date: today,
                events: [],
                message: "ไม่มีนัดหมายวันนี้",
              };
            }
            return {
              date: today,
              events: events.map((e) => ({
                title: e.title,
                start: e.start,
                end: e.end,
                location: e.location || "ไม่ระบุ",
              })),
            };
          } catch (error) {
            return {
              error: true,
              message: `ไม่สามารถโหลดปฏิทินได้: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
          }
        },
      },
      fetchGmail: {
        description: "ดึงข้อมูลอีเมลล่าสุดจาก Gmail ของผู้ใช้",
        inputSchema: z.object({
          count: z
            .number()
            .optional()
            .describe("Number of emails to fetch, defaults to 5"),
        }),
        execute: async () => {
          try {
            const msgs = await fetchGmailMessages();
            if (!msgs || msgs.length === 0) {
              return { messages: [], message: "ไม่มีอีเมลใหม่" };
            }
            return {
              messages: msgs.map((m) => ({
                subject: m.subject,
                from: m.from,
                date: m.date,
                snippet: m.snippet,
                isUnread: m.isUnread,
              })),
            };
          } catch (error) {
            return {
              error: true,
              message: `ไม่สามารถโหลดอีเมลได้: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
          }
        },
      },
      fetchNotes: {
        description: "ดึงข้อมูล Daily Notes ของวันที่ระบุจาก Supabase",
        inputSchema: z.object({
          date: z
            .string()
            .optional()
            .describe("Date in YYYY-MM-DD format, defaults to today"),
        }),
        execute: async ({ date }) => {
          try {
            const noteDate = date || today;
            const note = await fetchDailyNote(noteDate);
            if (!note) {
              return {
                date: noteDate,
                note: null,
                message: `ไม่พบบันทึกวันที่ ${noteDate}`,
              };
            }
            return {
              date: noteDate,
              note: {
                title: note.title,
                content: note.plain_text || "ไม่มีเนื้อหา",
                updatedAt: note.updated_at,
              },
            };
          } catch (error) {
            return {
              error: true,
              message: `ไม่สามารถโหลดบันทึกได้: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
          }
        },
      },
    },
  });

  // Fallback to toTextStreamResponse if toDataStreamResponse doesn't exist at runtime,
  // but we prefer toDataStreamResponse for tool call streaming compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = result;
  return res.toDataStreamResponse
    ? res.toDataStreamResponse()
    : res.toTextStreamResponse();
}
