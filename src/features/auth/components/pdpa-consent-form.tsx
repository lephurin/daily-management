"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updatePdpaConsent } from "@/features/user-profile/services/profile-actions";
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

import { useTranslations } from "next-intl";

export function PdpaConsentForm() {
  const t = useTranslations("Consent");
  const tp = useTranslations("Privacy");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleConsent = async () => {
    if (!agreed) return;
    setLoading(true);

    try {
      const res = await updatePdpaConsent(true);
      if (res.success) {
        await update({ hasConsented: true });
        router.push("/dashboard");
      } else {
        console.error("Failed to save consent:", res.error);
      }
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Privacy Policy Content */}
        <div className="max-h-80 overflow-y-auto rounded-lg border bg-muted/50 p-6 text-sm leading-relaxed">
          <h3 className="mb-4 text-base font-semibold">
            {tp("title")} – Daily Management
          </h3>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">{tp("q1_title")}</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>{tp("q1_item1")}</li>
              <li>{tp("q1_item2")}</li>
              <li>{tp("q1_item3")}</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">{tp("q2_title")}</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>{tp("q2_item1")}</li>
              <li>{tp("q2_item2")}</li>
              <li>{tp("q2_item3")}</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">{tp("q3_title")}</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>{tp("q3_item1")}</li>
              <li>{tp("q3_item2")}</li>
              <li>{tp("q3_item3")}</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="mb-2 font-medium">{tp("q5_title")}</h4>
            <p className="mb-2">{tp("q5_subtitle")}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{tp("q5_item1")}</li>
              <li>{tp("q5_item2")}</li>
              <li>{tp("q5_item3")}</li>
              <li>{tp("q5_item4")}</li>
            </ul>
          </section>

          <section>
            <h4 className="mb-2 font-medium">{tp("q8_title")}</h4>
            <p>{tp("q8_text")}</p>
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
            {t("checkbox")}
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
          {loading ? t("saving") : t("submit")}
        </Button>
      </CardFooter>
    </Card>
  );
}
