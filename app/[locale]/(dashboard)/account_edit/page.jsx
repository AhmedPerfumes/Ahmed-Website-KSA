import { redirect } from "next/navigation";

// Replaced by /account_dashboard — this route only kept so old links keep working
export default function Page({ params }) {
  redirect(`/${params.locale}/account_dashboard`);
}
