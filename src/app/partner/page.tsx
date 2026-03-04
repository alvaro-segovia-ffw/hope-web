import { PartnerDashboard } from "@/features/partner/components/partner-dashboard";
import { RoleGuard } from "@/features/auth/components/role-guard";

export default function PartnerPage() {
  return (
    <RoleGuard requiredRoles={["partner", "admin"]}>
      <PartnerDashboard />
    </RoleGuard>
  );
}
