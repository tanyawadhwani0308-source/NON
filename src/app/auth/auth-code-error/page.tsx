import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Authentication Error</CardTitle>
                    <CardDescription>
                        There was an error verifying your authentication code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-secondary-foreground">
                        The link may have expired or is invalid. Please try signing up or logging in again.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Return to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
