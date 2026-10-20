import { Site } from "@/components/Site";

// rebuilt daily so the footer year never goes stale
export const revalidate = 86400;

export default function Home() {
  return <Site />;
}
