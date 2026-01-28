import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loading } from "#/src/components/loading";

export default function Home() {

  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/login");
    },
  });

  if (status === "authenticated") {
    return redirect("/dashboard");
  } else if (status === "loading") {
    return <Loading />;
  }

  return redirect("/login");
}
