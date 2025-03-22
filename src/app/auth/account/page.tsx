import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { UserRound, Mail, Calendar, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import ChangePasswordForm from "@/components/accounts/change-password-form";
import UsernameForm from "@/components/accounts/username-form";
import DeleteAccountForm from "@/components/accounts/delete-account-form";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
        <div className="min-h-[calc(100vh-5.25rem)] bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Profile Overview Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="bg-gray-100 w-24 h-24 rounded-full flex justify-center items-center shrink-0">
                                <UserRound className="w-14 h-14 text-gray-600" />
                            </div>
                            <div className="flex flex-col items-center sm:items-start gap-2 flex-grow">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <h2 className="text-2xl font-semibold text-center sm:text-left">
                                        {userInfo.username}
                                    </h2>
                                    <Badge variant="outline" className="hidden sm:flex">
                                        {userInfo.user_privilege}
                                    </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{userInfo.email}</span>
                                    </div>
                                    <div className="hidden sm:block">•</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {formatDate(userInfo.created_at)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    {userInfo.warnings > 0 && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {userInfo.warnings} Warning{userInfo.warnings > 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                    {userInfo.is_suspended && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            Account Suspended
                                        </Badge>
                                    )}
                                </div>
                                <Link 
                                    href={`/user/${userInfo.first_username}`} 
                                    className="mt-2 text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    View public profile
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <UsernameForm userInfo={userInfo} />
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DeleteAccountForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
