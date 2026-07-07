import { getCsrfToken } from "@/lib/utils/csrf";

export async function CsrfField() {
  const token = await getCsrfToken();
  return <input type="hidden" name="csrf" value={token} />;
}
