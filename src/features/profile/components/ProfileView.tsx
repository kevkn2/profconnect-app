import Spinner from "@/components/ui/Spinner";
import { ProfessorProfile } from "@/services/professor/professor.dto";
import { StudentProfile } from "@/services/student/student.dto";
import { ProfileField } from "./ProfileField";
import { RoleEnum } from "@/types/role";

interface ProfileViewProps {
    role: RoleEnum;
    profile: ProfessorProfile | StudentProfile | null;
    loading: boolean;
    error: string | null;
}

export default function ProfileView({ role, profile, loading, error }: ProfileViewProps) {
    return (
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-lg bg-white p-8 shadow">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">My profile</h1>
                    {loading && (
                        <div className="mt-8 flex justify-center">
                            <Spinner size={24} />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="mt-6 rounded-md bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    {!loading && !error && profile && (
                        <>
                            <p className="mt-1 text-sm text-gray-500">
                                Signed in as {role}
                            </p>

                            <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <ProfileField label="Full name" value={profile.name} />
                                <ProfileField label="Email" value={profile.email} />
                                <ProfileField label="University" value={profile.university} />
                                <ProfileField label="Department" value={profile.department} />
                                {profile.role === "student" && (
                                    <ProfileField
                                        className="sm:col-span-2"
                                        label="Research interests"
                                        value={profile.research_interests}
                                    />
                                )}
                            </dl>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
