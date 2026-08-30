import { userLogout } from "@/lib/auth";

export async function POST() {
  await userLogout();
  // Redirect the browser back to the home page after logout
  return new Response(null, {
    status: 303,
    headers: { Location: "/" },
  });
}
