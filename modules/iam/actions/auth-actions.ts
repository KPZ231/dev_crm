"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "../schemas";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/core/logger/audit";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export const registerAction = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Nieprawidłowe dane." };
  }

  const { email, password, name } = validatedFields.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Ten email jest już w użyciu." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Audit Log for registration
    await createAuditLog({
      action: "auth.register",
      entityType: "User",
      entityId: user.id,
      actorId: user.id,
      metadata: { email: user.email },
    });

    return { success: "Konto zostało pomyślnie utworzone! Skonfiguruj teraz swoje pierwsze logowanie." };
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return { error: "Wystąpił błąd podczas rejestracji." };
  }
};

export const loginAction = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Nieprawidłowe dane uwierzytelniające." };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser || !existingUser.passwordHash) {
    return { error: "Nieprawidłowy email lub hasło." }; 
  }

  try {
    // The actual sign in is deferred to NextAuth credentials provider
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
    
    // Note: Audit log for successful login can optionally be handled in NextAuth events, 
    // or tracked here if doing manual JWT tokens. Because NextAuth redirects on success, 
    // lines below are rarely reached if signIn handles the redirect.
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Nieprawidłowe dane logowania." };
        default:
          return { error: "Wystąpił błąd logowania." };
      }
    }
    // Required to allow NextAuth redirection to work in Server Actions
    throw error;
  }
};
