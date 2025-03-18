import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { UserRound, Mail, Calendar1 } from 'lucide-react';
import ChangePasswordForm from "@/components/accounts/change-password-form";
import UsernameForm from "@/components/accounts/username-form";
import DeleteAccountForm from "@/components/accounts/delete-account-form";
import { formatDate } from "@/lib/utils"

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
        <div className="h-[calc(100vh-4rem)] bg-gray-50 flex justify-center p-6">
            <div className="flex flex-col gap-2 bg-white shadow-md h-fit p-8 min-w-[500px] w-1/4 rounded-lg">
                <div className="flex flex-col items-center mb-4 gap-2">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex justify-center items-center">
                        <UserRound width="3rem" height="3rem" color="#333333" className="" />
                    </div>
                    <span className="font-medium text-xl">{userInfo.username}</span>
                    <div className="flex gap-2 text-gray-600 text-sm font-medium items-center">
                        <Mail height="1rem" />
                        <span>{userInfo.email}</span>
                    </div>
                    <div className="flex gap-2 text-gray-600 text-sm font-medium items-center">
                        <Calendar1 height="1rem" />
                        <span>{formatDate(userInfo.created_at)}</span>
                    </div>
                </div>
                <UsernameForm userInfo={userInfo} />
                <ChangePasswordForm />
                <hr className="mt-4 mb-2" />
                <DeleteAccountForm />
            </div>
        </div>
    );
}
