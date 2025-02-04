'use client';

import Link from "next/link";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RegisterFormSchema } from "@/lib/zod";
import { RegisterFormState, registerUser } from "@/lib/auth/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function RegistrationPage() {
    const [tosChecked, setTosChecked] = useState(false);
    const initialState: RegisterFormState = {
        message: null,
        errors: {},
    };

    const [state, formAction, isPending] = useActionState(
        registerUser,
        initialState,
    );

    const form = useForm<z.output<typeof RegisterFormSchema>>({
        resolver: zodResolver(RegisterFormSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            ...(state?.fields ?? {}),
        },
        mode: "onTouched",
    });

    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-50">
            <Form {...form}>
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(() => formRef.current?.submit())}
                    action={formAction}
                    className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md h-fit mt-20"
                >
                    <h2 className="text-center text-3xl font-bold text-gray-800">Register</h2>
                    <p className="text-center text-sm text-gray-500">
                        Welcome! Please register your account.
                    </p>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Enter your username"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage>{state.errors?.username}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter your email"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage>{state.errors?.email}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your password"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage>{state.errors?.password}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Confirm your password"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage>{state.errors?.confirmPassword}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm flex items-center gap-2 hover:cursor-pointer">
                                <Checkbox
                                    name="termsOfService"
                                    value="true"
                                    checked={tosChecked}
                                    onCheckedChange={(checked: boolean) => {
                                        setTosChecked(checked);
                                    }}
                                />
                                <p>
                                    Accept{" "}
                                    <Link href="" className="text-blue-600 p-0 m-0 hover:underline">
                                        terms and conditions
                                    </Link>
                                    .
                                </p>
                            </label>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Button type="submit" className="w-full" disabled={isPending || !tosChecked}>
                            {isPending ? "Submitting .." : "Register"}
                        </Button>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-blue-600 hover:underline">
                            Log In
                        </Link>
                    </p>
                    {state.success === false ? <p className="text-red-400 flex justify-center text-sm">{state.message}</p> : ""}
                </form >
            </Form >
        </div >
    );
}
