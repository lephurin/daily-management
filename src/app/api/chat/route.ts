import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `คุณคือ AI Assistant ของ Daily Tracking Dashboard
คุณช่วยสรุปงาน, ตอบคำถามเกี่ยวกับ Jira Tasks, Calendar Events, และ Daily Notes
ตอบเป็นภาษาไทยเป็นหลัก แต่สามารถตอบภาษาอังกฤษได้ตามความเหมาะสม
ให้ข้อมูลที่ชัดเจน กระชับ และเป็นประโยชน์`,
    messages,
    tools: {
      fetchJiraTasks: {
        description: "ดึงข้อมูล Jira Tasks จาก Active Sprint ของผู้ใช้",
        inputSchema: z.object({
          boardId: z.string().optional().describe("Jira Board ID (optional)"),
        }),
        execute: async () => {
          // TODO: Integrate with actual Jira API via fetchJiraActiveSprint
          return {
            sprint: "Sprint 12",
            tasks: [
              {
                key: "PROJ-101",
                summary: "Implement login page",
                status: "In Progress",
              },
              {
                key: "PROJ-102",
                summary: "Fix dashboard bug",
                status: "To Do",
              },
              {
                key: "PROJ-103",
                summary: "Write unit tests",
                status: "Done",
              },
            ],
          };
        },
      },
      fetchCalendar: {
        description: "ดึงข้อมูล Calendar Events ของวันนี้",
        inputSchema: z.object({
          date: z.string().optional().describe("Date in YYYY-MM-DD format"),
        }),
        execute: async () => {
          // TODO: Integrate with actual Calendar API via fetchCalendarEvents
          return {
            date: new Date().toISOString().split("T")[0],
            events: [
              {
                title: "Daily Standup",
                time: "09:00-09:15",
                location: "Online",
              },
              {
                title: "Sprint Planning",
                time: "14:00-15:00",
                location: "Meeting Room A",
              },
            ],
          };
        },
      },
      fetchNotes: {
        description: "ดึงข้อมูล Daily Notes ของวันที่ระบุ",
        inputSchema: z.object({
          date: z.string().optional().describe("Date in YYYY-MM-DD format"),
        }),
        execute: async () => {
          // TODO: Integrate with actual daily notes from Supabase
          return {
            date: new Date().toISOString().split("T")[0],
            notes: [
              {
                title: "Daily Note",
                content:
                  "Worked on dashboard layout and drag-and-drop feature.",
              },
            ],
          };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
