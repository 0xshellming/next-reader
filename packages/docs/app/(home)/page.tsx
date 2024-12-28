'use client';

import WithThumbnails from "@/components/thumbnails";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("fileUrl");
  if (!fileUrl) {
    return <div>No file URL provided</div>;
  }
  return <WithThumbnails fileUrl={fileUrl} />;
}
