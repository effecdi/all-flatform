import { PageTransition } from "@/components/page-transition";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SettingsPage() {
  const { data: profile } = useBusinessProfile();

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">설정</h1>
        </div>

        {/* Business profile */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">사업 프로필</h2>
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="text-xs">
                {profile ? "수정" : "작성하기"}
              </Button>
            </Link>
          </div>
          {profile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">회사명</span>
                <span>{profile.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">단계</span>
                <span>{profile.businessStage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">업종</span>
                <span>{profile.industrySector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">지역</span>
                <span>{profile.region}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">프로필이 아직 작성되지 않았습니다.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
