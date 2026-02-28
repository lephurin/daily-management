import { UserProfileForm } from "@/features/user-profile/components/user-profile-form";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          จัดการโปรไฟล์และการตั้งค่าบัญชี
        </p>
      </div>
      <UserProfileForm />
    </div>
  );
}
