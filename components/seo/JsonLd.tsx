/**
 * Emits a JSON-LD structured-data script. Accepts a schema object/array, or a
 * raw JSON string (e.g. the translation `structured_data` field).
 */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
