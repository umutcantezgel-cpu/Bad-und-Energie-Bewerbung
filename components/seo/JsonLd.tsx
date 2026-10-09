export interface JsonLdProps {
  /** A schema.org node, a list of nodes or a `{ '@context', '@graph' }` object. */
  data: object | readonly object[];
}

/** JSON for a <script> body: `<` is escaped, so text from data can never close the tag. */
export function serializeJsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Renders structured data as `<script type="application/ld+json">`. Server-safe. */
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLdScript(data) }} />;
}

export default JsonLd;
