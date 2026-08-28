import type { Metadata } from "next";
import { PERSON_NAME } from "@/lib/identity";
import { absoluteCanonicalUrl, assertCanonicalPath, type CanonicalPath } from "./canonical";
import { OPEN_GRAPH_IMAGE_SIZE, openGraphImageUrl } from "./open-graph";
import { labTools } from "@/data/lab-tools";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: CanonicalPath;
  imageAlt?: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
};

/** Build complete, self-referencing metadata for an indexable public page. */
export function createPageMetadata({
  title,
  description,
  path,
  imageAlt,
  type = "website",
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  assertCanonicalPath(path);
  const socialTitle = absoluteTitle ? title : `${title} — ${PERSON_NAME}`;
  const socialImage = { url: openGraphImageUrl(path), width:OPEN_GRAPH_IMAGE_SIZE.width, height:OPEN_GRAPH_IMAGE_SIZE.height, type:"image/png", alt: imageAlt ?? socialTitle };
  const socialUrl=absoluteCanonicalUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url: socialUrl,
      siteName: PERSON_NAME,
      locale: "en_GB",
      type,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}

type ToolMetadataOptions=Omit<PageMetadataOptions,"path">&{path:`/lab/${string}`};

/** Metadata contract for registered, canonical Lab tool routes. */
export function createToolPageMetadata(options:ToolMetadataOptions):Metadata{
  if(!labTools.some(tool=>`/lab/${tool.slug}`===options.path))throw new Error(`Metadata requires a registered Lab tool for ${options.path}.`);
  return createPageMetadata(options);
}
