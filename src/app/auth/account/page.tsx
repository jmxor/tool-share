import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRound, Mail, Calendar1, Trash2} from 'lucide-react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

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
            <div className="flex flex-col gap-2 bg-white shadow-md h-fit p-8 min-w-96 w-1/4 rounded-lg">
                <div className="flex flex-col items-center mb-4 gap-2">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex justify-center items-center">
                        <UserRound width="3rem" height="3rem" color="#333333" className=""/>
                    </div>
                    <span className="font-medium text-xl">testuser1</span>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                    <div className="flex gap-2">
                        <Mail />
                        <span>testuser1@gmail.com</span>
                    </div>
                    <div className="flex gap-2">
                        <Calendar1 />
                        <span>15th November 2024</span>
                    </div>
                </div>
                <form className="bg-gray-100 p-2 rounded-lg">
                    <h2 className="font-medium text-lg mb-2">Change Username</h2>
                    <div className="flex gap-2">
                        <Input name="change-username" type="text" placeholder="New Username" className="w-full bg-white" />
                        <Button type="submit" className="w-fit">Update</Button>
                    </div>
                </form>
                <form className="bg-gray-100 p-2 rounded-lg">
                    <h2 className="font-medium text-lg mb-2">Change Password</h2>
                    <div className="flex flex-col gap-2">
                        <Input name="current-password" type="password" placeholder="Current Password" className="w-full bg-white" />
                        <Input name="new-password" type="password" placeholder="New Password" className="w-full bg-white" />
                        <Input name="current-password" type="password" placeholder="Confirm New Password" className="w-full bg-white" />
                        <Button type="submit" className="w-full">Confirm Change</Button>
                    </div>
                </form>
                <hr className="mt-4 mb-2"/>
                <form className="flex flex-col gap-2">
                    <h2 className="text-xl text-center text-red-500 font-bold">Dangerous!</h2>
                    <label className="flex p-2 gap-2 items-center">
                        <Checkbox />
                        <p>I acknowledge that by clicking the button bellow, my account will be permanently deleted without any chance of recovery.</p>
                    </label>
                    <Button className="bg-red-500 text-white w-full hover:bg-red-600"><Trash2 /> Permanently Delete Account</Button>
                </form>
            </div>
        </div>
    );
}
