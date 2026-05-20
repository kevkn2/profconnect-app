import { ProjectDetailContainer } from "@/features/projects";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProfessorProjectDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <ProjectDetailContainer projectId={id} />;
}
