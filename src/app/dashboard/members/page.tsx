import { MemberDataTable } from "@/features/members/components/member-data-table";

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">จัดการสมาชิก</h2>
        <p className="text-sm text-muted-foreground">
          จัดการรายชื่อผู้ใช้และสิทธิ์การเข้าถึง (เฉพาะ Super Admin)
        </p>
      </div>
      <MemberDataTable />
    </div>
  );
}
