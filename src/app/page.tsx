import { redirect } from "next/navigation";

export default function Home() {
  // TODO: If already logged in, redirect to dashboard
  return redirect("/login");
}
