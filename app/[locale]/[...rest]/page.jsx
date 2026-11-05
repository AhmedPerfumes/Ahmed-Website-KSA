import { notFound } from "next/navigation";

// Any URL that matches no route renders the branded app/[locale]/not-found.jsx
// (without this, Next shows its default "This page could not be found" screen).
export default function CatchAllNotFound() {
  notFound();
}
