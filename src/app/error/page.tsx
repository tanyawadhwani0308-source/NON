import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
    return (
        <div className="min-h-screen bg-[#DCCFC2] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#F5F1ED] p-10 rounded-[32px] shadow-2xl border border-white/50 text-center">
                <h1 className="text-4xl font-serif text-[#3E3835] mb-4">Oops!</h1>
                <p className="text-[#8C847F] mb-8">
                    Something went wrong. This might be due to an incorrect login, invalid environment variables, or a database issue.
                </p>
                <Button asChild className="w-full h-12 rounded-xl border-[#8C847F]/20 text-white bg-[#3E3835] hover:bg-[#2A2522]">
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    )
}
