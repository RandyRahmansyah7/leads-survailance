export default function MapEmbed({ query }: { query: string }) {
  return (
    <iframe
      title={`Peta: ${query}`}
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      loading="lazy"
      className="h-72 w-full rounded-md border border-neutral-300 dark:border-neutral-700"
    />
  );
}
