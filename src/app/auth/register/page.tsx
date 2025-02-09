'use client';

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useActionState, useEffect, useState } from "react";
import { registerUser } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { LocalErrors } from "@/lib/types";

export default function RegistrationPage() {
    const router = useRouter()

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsOfService, setTermsOfService] = useState(false);
    const [localErrors, setLocalErrors] = useState<LocalErrors>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsOfService: ""
    });
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
        termsOfService: false
    });

    useEffect(() => {
        validateForm();
    }, [username, email, password, confirmPassword, termsOfService]);

    async function handleSubmit(prevState: string | undefined, formData: FormData) {
        if (validateForm()) {
            const res = await registerUser(formData);

            if (res === 'Username is already registered.') {
                setUsername("");
            }
            if (res === 'Email is already registered.') {
                setEmail("");
            }

            if (res === "Success") {
                router.push('/auth/login');
            }

            return res;
        };

        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true,
            termsOfService: true,
        });

        return "There is missing or incorrect data in the form.";
    }

    const [state, formAction, isPending] = useActionState(
        handleSubmit,
        undefined
    );


    function validateForm() {
        const errors: LocalErrors = {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            termsOfService: ""
        };

        let valid = true;

        if (!username) {
            errors.username = 'Username is required';
            valid = false;
        } else if (username.length < 1 || username.length > 32) {
            errors.username = 'Username cannot be longer than 32 characters.';
            valid = false;
        } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
            errors.username = 'Username can only contain letters and numbers.';
            valid = false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            errors.email = 'Email is required';
            valid = false;
        } else if (!emailRegex.test(email) || email.length > 254) {
            errors.email = 'Please enter a valid email address.';
            valid = false;
        }

        if (!password) {
            errors.password = 'Password is required';
            valid = false;
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters long.';
            valid = false;
        }

        if (!confirmPassword || confirmPassword !== password) {
            errors.confirmPassword = 'Passwords do not match.';
            valid = false;
        }

        if (!termsOfService) {
            errors.termsOfService = 'You must accept the terms of service to register.';
            valid = false;
        }

        setLocalErrors(errors);

        return valid;
    }

    function handleBlur(field: string) {
        validateForm();
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    const errorStyling = "text-sm px-2 text-red-500"

    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-50">
            <form
                action={formAction}
                className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md h-fit mt-20"
            >
                <h2 className="text-center text-3xl font-bold text-gray-800">Register</h2>
                <p className="text-center text-sm text-gray-500">
                    Welcome! Please register your account.
                </p>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Input
                            name="username"
                            type="text"
                            placeholder="Enter your Display Name"
                            className="w-full"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); }}
                            onBlur={() => handleBlur("username")}
                        />
                        {touched.username && localErrors.username && (
                            <p className={errorStyling}>{localErrors.username}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur("email")}
                        />
                        {touched.email && localErrors.email && (
                            <p className={errorStyling}>{localErrors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur("password")}
                        />
                        {touched.password && localErrors.password && (
                            <p className={errorStyling}>{localErrors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            className="w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => handleBlur("confirmPassword")}
                        />
                        {touched.confirmPassword && localErrors.confirmPassword && (
                            <p className={errorStyling}>{localErrors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm flex items-center gap-2 hover:cursor-pointer">
                            <Checkbox
                                name="termsOfService"
                                value="true"
                                checked={termsOfService}
                                onCheckedChange={(checked: boolean) => {
                                    setTermsOfService(checked);
                                    handleBlur("termsOfService");
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
                        {touched.termsOfService && localErrors.termsOfService && (
                            <p className={errorStyling}>{localErrors.termsOfService}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-1">
                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                    {isPending ? <p>Submitting ...</p> : <p className={state === 'Success' ? "text-green-500 w-full flex justify-center" : errorStyling}>{state}</p>}
                </div>
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-blue-600 hover:underline">
                        Log In
                    </a>
                </p>
            </form>
        </div>
    );
}
