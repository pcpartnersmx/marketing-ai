import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function PrivatePage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
        redirect('/login')
    }

    return <p>Hello {session.user.email}</p>
}