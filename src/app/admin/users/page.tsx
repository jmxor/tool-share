"use client";

import { useState, useEffect } from "react";
import { AdminUser, UserPrivilege } from "@/lib/admin/types";
import {
  getUsers,
  toggleUserSuspension,
  updateUserPrivilege,
  getCurrentUserEmail,
  issueWarning,
} from "@/lib/admin/actions";
import {
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [suspendReason, setSuspendReason] = useState("");
  const [userToSuspend, setUserToSuspend] = useState<AdminUser | null>(null);
  const [userToWarn, setUserToWarn] = useState<AdminUser | null>(null);
  const [warnReason, setWarnReason] = useState("");
  const [privilegeUser, setPrivilegeUser] = useState<AdminUser | null>(null);
  const [newPrivilege, setNewPrivilege] = useState<UserPrivilege>(
    UserPrivilege.USER,
  );
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isPrivilegeDialogOpen, setIsPrivilegeDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

  const fetchUsers = useCallback(
    async (page: number, search: string = searchTerm) => {
      setIsLoading(true);
      try {
        const result = await getUsers(page, 10, search);
        setUsers(result.data);
        setPageCount(result.pageCount);
        setCurrentPage(result.currentPage);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setUsers, setPageCount, setCurrentPage, searchTerm],
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const usernameParam = urlParams.get("username");

        if (usernameParam) {
          setSearchTerm(usernameParam);
        }

        const userData = await getCurrentUserEmail();
        if (userData?.user?.email) {
          setCurrentUserEmail(userData.user.email);
        }

        await fetchUsers(1, usernameParam || "");
      } catch (error) {
        console.error("Error initializing page:", error);
      }
    };

    loadInitialData();
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const openWarningDialog = (user: AdminUser) => {
    setUserToWarn(user);
    setWarnReason("");
  };

  const openSuspendDialog = (user: AdminUser) => {
    setUserToSuspend(user);
    setSuspendReason("");
  };

  const openPrivilegeDialog = (user: AdminUser) => {
    setPrivilegeUser(user);
    setNewPrivilege(user.user_privilege);
  };

  const handleIssueWarning = async () => {
    if (!userToWarn) return;
    try {
      const success = await issueWarning(userToWarn.id, warnReason);
      if (success) {
        setUsers(
          users.map((user) => {
            if (user.id === userToWarn.id) {
              const newWarningCount = user.warnings + 1;
              return {
                ...user,
                warnings: newWarningCount,
                is_suspended: newWarningCount >= 3 ? true : user.is_suspended,
              };
            }
            return user;
          }),
        );
        setUserToWarn(null);
        setIsWarningDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to issue warning:", error);
    }
  };

  const handleSuspendUser = async (suspend: boolean) => {
    if (!userToSuspend) return;

    try {
      const success = await toggleUserSuspension(
        userToSuspend.id,
        suspend,
        suspendReason,
      );
      if (success) {
        setUsers(
          users.map((user) =>
            user.id === userToSuspend.id
              ? { ...user, is_suspended: suspend }
              : user,
          ),
        );
        setUserToSuspend(null);
        setIsSuspendDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle user suspension:", error);
    }
  };

  const handleUpdatePrivilege = async () => {
    if (!privilegeUser) {
      console.error("No user selected for privilege update");
      return;
    }

    try {
      const success = await updateUserPrivilege(privilegeUser.id, newPrivilege);
      if (success) {
        setUsers(
          users.map((user) =>
            user.id === privilegeUser.id
              ? { ...user, user_privilege: newPrivilege }
              : user,
          ),
        );
        console.log("Privilege updated successfully");
        setPrivilegeUser(null);
        setIsPrivilegeDialogOpen(false);
        router.refresh();
      } else {
        console.error("Server returned failure when updating privilege");
      }
    } catch (error) {
      console.error("Failed to update user privilege:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPrivilegeBadgeColor = (privilege: UserPrivilege) => {
    switch (privilege) {
      case UserPrivilege.ADMIN:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case UserPrivilege.MODERATOR:
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Warnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/user/${user.first_username}`)}
                >
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Badge
                      className={getPrivilegeBadgeColor(user.user_privilege)}
                    >
                      {user.user_privilege}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.warnings}</TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog
                          open={
                            isPrivilegeDialogOpen &&
                            privilegeUser?.id === user.id
                          }
                          onOpenChange={(open) => {
                            if (!open) setIsPrivilegeDialogOpen(false);
                          }}
                        >
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                // Don't allow changing own permissions
                                if (user.email === currentUserEmail) {
                                  alert(
                                    "You cannot change your own permissions.",
                                  );
                                  return;
                                }
                                openPrivilegeDialog(user);
                                setIsPrivilegeDialogOpen(true);
                              }}
                              disabled={user.email === currentUserEmail}
                              className={
                                user.email === currentUserEmail
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                              {user.email === currentUserEmail && (
                                <span className="ml-1 text-xs opacity-70">
                                  (unavailable)
                                </span>
                              )}
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change User Role</DialogTitle>
                              <DialogDescription>
                                Change the role and permissions for{" "}
                                {user.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Select
                                defaultValue={user.user_privilege}
                                value={
                                  privilegeUser?.id === user.id
                                    ? newPrivilege
                                    : user.user_privilege
                                }
                                onValueChange={(value) => {
                                  if (
                                    !privilegeUser ||
                                    privilegeUser.id !== user.id
                                  ) {
                                    openPrivilegeDialog(user);
                                  }
                                  setNewPrivilege(value as UserPrivilege);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={UserPrivilege.USER}>
                                    User
                                  </SelectItem>
                                  <SelectItem value={UserPrivilege.MODERATOR}>
                                    Moderator
                                  </SelectItem>
                                  <SelectItem value={UserPrivilege.ADMIN}>
                                    Admin
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setPrivilegeUser(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleUpdatePrivilege}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={
                            isWarningDialogOpen && userToWarn?.id === user.id
                          }
                          onOpenChange={(open) => {
                            if (!open) setIsWarningDialogOpen(false);
                          }}
                        >
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                openWarningDialog(user);
                                setIsWarningDialogOpen(true);
                              }}
                              disabled={user.email === currentUserEmail}
                              className={
                                user.email === currentUserEmail
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Issue Warning
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Issue Warning</DialogTitle>
                              <DialogDescription>
                                Issue a warning to {user.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Reason for warning..."
                                value={warnReason}
                                onChange={(e) => setWarnReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setUserToWarn(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleIssueWarning}>
                                Issue Warning
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={
                            isSuspendDialogOpen && userToSuspend?.id === user.id
                          }
                          onOpenChange={(open) => {
                            if (!open) setIsSuspendDialogOpen(false);
                          }}
                        >
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                openSuspendDialog(user);
                                setIsSuspendDialogOpen(true);
                              }}
                            >
                              {user.is_suspended ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Unsuspend User
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Suspend User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {user.is_suspended
                                  ? "Unsuspend User"
                                  : "Suspend User"}
                              </DialogTitle>
                              <DialogDescription>
                                {user.is_suspended
                                  ? `Are you sure you want to unsuspend ${user.username}?`
                                  : `Provide a reason for suspending ${user.username}`}
                              </DialogDescription>
                            </DialogHeader>
                            {!user.is_suspended && (
                              <div className="py-4">
                                <Textarea
                                  placeholder="Reason for suspension..."
                                  value={
                                    userToSuspend?.id === user.id
                                      ? suspendReason
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setSuspendReason(e.target.value)
                                  }
                                  rows={3}
                                  onFocus={() => openSuspendDialog(user)}
                                />
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setUserToSuspend(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant={
                                  user.is_suspended ? "default" : "destructive"
                                }
                                onClick={() =>
                                  handleSuspendUser(!user.is_suspended)
                                }
                              >
                                {user.is_suspended
                                  ? "Unsuspend User"
                                  : "Suspend User"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

