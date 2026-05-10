import { ProtectedLayout } from '@/features/auth'
import { DashboardView } from '@/features/dashboard/components/DashboardView'

export default function DashboardPage() {
    return (
        <ProtectedLayout>
            <DashboardView role="student"/>
        </ProtectedLayout>
    )
}
