"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import AuthenticatedLayout from './authenticated-layout'
import { ProductProvider, useProduct } from '@/contexts/product-context'
import { ViewProvider, useView } from '@/contexts/view-context'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession()
    const [progress, setProgress] = useState(0)
    const [showLoader, setShowLoader] = useState(true)

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (status === 'loading') {
            timer = setInterval(() => {
                setProgress((prevProgress) => {
                    const newProgress = prevProgress + Math.random() * 15 + 5
                    if (newProgress >= 100) {
                        clearInterval(timer)
                        // Esperar un poco más antes de ocultar el loader
                        setTimeout(() => {
                            setShowLoader(false)
                        }, 500)
                        return 100
                    }
                    return newProgress
                })
            }, 150)

            return () => clearInterval(timer)
        } else if ((status === 'authenticated' || status === 'unauthenticated') && progress < 100) {
            // Si la sesión se resuelve antes de llegar al 100%, completar la animación
            timer = setInterval(() => {
                setProgress((prevProgress) => {
                    const newProgress = prevProgress + 15
                    if (newProgress >= 100) {
                        clearInterval(timer)
                        setTimeout(() => {
                            setShowLoader(false)
                        }, 500)
                        return 100
                    }
                    return newProgress
                })
            }, 50)

            return () => clearInterval(timer)
        }
    }, [status, progress])

    if (status === 'loading' || showLoader) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6 w-full max-w-sm px-6">
                    <Image 
                        src="/logo.webp" 
                        alt="Logo" 
                        width={200}
                        height={200}
                        className="animate-pulse"
                    />
                    <div className="w-full space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground text-center">
                            {Math.round(progress)}%
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'authenticated') {
        return (
            <ViewProvider>
                <ProductProvider>
                    <AuthenticatedLayoutWrapper>
                        {children}
                    </AuthenticatedLayoutWrapper>
                </ProductProvider>
            </ViewProvider>
        )
    } else {
        return <div>
            {children}
        </div>
    }
}

function AuthenticatedLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { selectedProductId, setSelectedProductId, setIsAddingProduct } = useProduct();
    const { setIsCampaignFormOpen } = useView();
    
    return (
        <AuthenticatedLayout
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
            onAddProduct={() => setIsAddingProduct(true)}
            onAddCampaign={() => setIsCampaignFormOpen(true)}
        >
            {children}
        </AuthenticatedLayout>
    );
}

export default Layout