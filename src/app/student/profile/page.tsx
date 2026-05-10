import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import ProfileContainer from "@/features/profile/components/ProfileContainer";


export default function StudentProfilePage() {
    return (
        <ProtectedLayout>
            <ProfileContainer />
        </ProtectedLayout>
    );
}
