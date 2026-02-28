import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const singleDate = searchParams.get("date");

    // Determine date range
    const exportDate =
      singleDate || startDate || new Date().toISOString().split("T")[0];

    // TODO: Fetch actual notes from Supabase
    // For now, create sample data structure
    const notesData = [
      {
        日付: exportDate,
        タイトル: "Sample Daily Note",
        内容: "This is placeholder content. Connect Supabase to get actual data.",
        作成日: new Date().toISOString(),
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(notesData);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 30 }, // Title
      { wch: 60 }, // Content
      { wch: 20 }, // Created
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Daily Notes");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Format filename
    const filename = endDate
      ? `daily-report-${startDate}-to-${endDate}.xlsx`
      : `daily-report-${exportDate}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
