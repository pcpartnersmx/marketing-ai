
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import type { NextAuthOptions } from "next-auth";
import { getPermissionsForRole } from '@/lib/permissions';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Obtener permisos del usuario
                    let permissions: string[] = (user as any).permissions || [];
                    
                    // Si el usuario no tiene permisos, asignar todos los permisos (migración automática)
                    if (permissions.length === 0) {
                        console.log(`🔄 Migrando permisos para usuario: ${user.email}`);
                        permissions = getPermissionsForRole('ADMIN'); // Asignar todos los permisos
                        
                        // Actualizar en la base de datos
                        try {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { permissions }
                            });
                            console.log(`✅ Permisos migrados para: ${user.email}`);
                        } catch (error) {
                            console.error(`❌ Error migrando permisos para ${user.email}:`, error);
                        }
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || '',
                        permissions: permissions,
                    };
                } catch (error) {
                    console.error('Error during authentication:', error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.permissions = user.permissions;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
