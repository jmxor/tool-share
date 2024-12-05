"use server";

interface Result {
    status: string,
    errors: string[]
}

export async function RegisterUser(formData: FormData): Promise<Result> {
    const errors: string[] = []

    const result: Result = {
        status:  "",
        errors
    }
    
    return result;
}