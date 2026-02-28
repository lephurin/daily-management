"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PdpaConsentForm() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConsent = async () => {
    if (!agreed) return;
    setLoading(true);

    try {
      // TODO: Call server action to update user's pdpa_consented in DB
      // await updatePdpaConsent(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          นโยบายความเป็นส่วนตัว (PDPA)
        </CardTitle>
        <CardDescription>
          กรุณาอ่านและยอมรับนโยบายความเป็นส่วนตัวก่อนเข้าใช้งานระบบ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Privacy Policy Content */}
        <div className="max-h-80 overflow-y-auto rounded-lg border bg-muted/50 p-6 text-sm leading-relaxed">
          <h3 className="mb-4 text-base font-semibold">
            Privacy Policy – Daily Tracking Dashboard
          </h3>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">1. ข้อมูลที่เราเก็บรวบรวม</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>ข้อมูลบัญชี: ชื่อ, อีเมล, รูปโปรไฟล์จาก Google Account</li>
              <li>ข้อมูลการใช้งาน: บันทึกประจำวัน, การตั้งค่า Dashboard</li>
              <li>
                ข้อมูลจากบริการภายนอก: Jira Tasks, Calendar Events
                (เมื่อผู้ใช้เชื่อมต่อ)
              </li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">2. วัตถุประสงค์ในการใช้ข้อมูล</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>เพื่อให้บริการ Dashboard และฟีเจอร์ต่างๆ</li>
              <li>เพื่อสร้างรายงาน AI Summary</li>
              <li>เพื่อส่งออกข้อมูลในรูปแบบ Excel</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">3. การปกป้องข้อมูล</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>ข้อมูลถูกเก็บบน Supabase ที่เข้ารหัส</li>
              <li>ใช้ Row-Level Security (RLS) เพื่อควบคุมการเข้าถึง</li>
              <li>Token ภายนอกถูกเข้ารหัสก่อนจัดเก็บ</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">4. สิทธิ์ของเจ้าของข้อมูล</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>สิทธิ์ในการเข้าถึงข้อมูลของตนเอง</li>
              <li>สิทธิ์ในการแก้ไขข้อมูล</li>
              <li>สิทธิ์ในการลบข้อมูล</li>
              <li>สิทธิ์ในการถอนความยินยอม</li>
            </ul>
          </section>

          <section>
            <h4 className="mb-2 font-medium">5. การติดต่อ</h4>
            <p>
              หากมีคำถามเกี่ยวกับนโยบายนี้ สามารถติดต่อผ่านระบบ Support
              ภายในแอปพลิเคชัน
            </p>
          </section>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="pdpa-consent"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <Label
            htmlFor="pdpa-consent"
            className="cursor-pointer text-sm leading-relaxed"
          >
            ฉันได้อ่านและยอมรับนโยบายความเป็นส่วนตัว (Privacy Policy)
            และยินยอมให้ระบบเก็บรวบรวม ใช้
            และเปิดเผยข้อมูลส่วนบุคคลตามที่ระบุไว้ข้างต้น
          </Label>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleConsent}
          disabled={!agreed || loading}
          className="w-full"
          size="lg"
        >
          {loading ? "กำลังบันทึก..." : "ยอมรับและเข้าสู่ระบบ"}
        </Button>
      </CardFooter>
    </Card>
  );
}
