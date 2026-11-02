import { SITE_NAME } from "@/data";

export default function Home() {
  return (
    <main className="grow">
      <h1 className="sr-only">{SITE_NAME}</h1>
    </main>
  );
}
