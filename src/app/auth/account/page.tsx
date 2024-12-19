import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import AccountInfo from "@/components/accounts/account-info";
import ChangePassword from "@/components/accounts/change-password";

export default async function AccountPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/auth/login');
    }

    const userInfo = await getUserByEmail(session.user.email as string);
    if (!userInfo) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
            <Tabs defaultValue="account" className="w-[500px]">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="dangerous" className="text-red-400">Dangerous!</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <AccountInfo userInfo={userInfo} />
                </TabsContent>
                <TabsContent value="password">
                    <ChangePassword />
                </TabsContent>
                <TabsContent value="dangerous">

                </TabsContent>
            </Tabs>
        </div>
    );
}