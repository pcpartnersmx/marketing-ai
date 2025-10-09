'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        redirect('/login?error=signup-failed')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: email.split('@')[0], // Use email prefix as default name
        }
    })

    revalidatePath('/', 'layout')
    redirect('/login?success=account-created&auto-login=true')
}