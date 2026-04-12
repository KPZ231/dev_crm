import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki").optional(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki").optional(),
  image: z.string().url("Nieprawidłowy adres URL").optional(),
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(3, "Nazwa workspace musi mieć co najmniej 3 znaki"),
  slug: z.string().min(3, "Slug musi mieć co najmniej 3 znaki").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
});
