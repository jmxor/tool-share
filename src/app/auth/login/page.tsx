"use client";

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { LoginFormState, loginUser } from "@/lib/auth/actions";
import { useActionState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginFormSchema } from "@/lib/zod";
import { z } from "zod";

export default function LoginPage() {

    const initialState: LoginFormState = {
        message: null,
        errors: {}
    }

    const [state, formAction, isPending] = useActionState(
        loginUser,
        initialState,
    );

    const form = useForm<z.output<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full justify-center bg-gray-50">
            <Form {...form}>
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(() => formRef.current?.submit())}
                    action={formAction}
                    className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md h-fit mt-20"
                >
                    <h2 className="text-center text-3xl font-bold text-gray-800">Log In</h2>
                    <p className="text-center text-sm text-gray-500">
                        Welcome back! Please log in to your account.
                    </p>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your email" className="w-full" />
                                    </FormControl>
                                    <FormMessage>
                                        {state?.errors?.email && state.errors.email.map((error, i) => (
                                            <span key={i}>{error}</span>
                                        ))}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Enter your password" className="w-full" />
                                    </FormControl>
                                    <FormMessage>
                                        {state?.errors?.password && state.errors.password.map((error, i) => (
                                            <span key={i}>{error}</span>
                                        ))}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Submitting .." : "Log In"}
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                        Dont have an account yet?{" "}
                        <a href="/auth/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </p>
                    {state.success === false ? <p className="text-red-400 flex justify-center text-sm">{state.message}</p> : ""}

                </form>
            </Form>
        </div>
    );
}
