import LoginPage from "@/src/aura/features/view/auth/Login"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - AURA",
  description: "Faça login para acessar sua conta AURA",
}

export default function Login() {
  return <LoginPage />
}
