export async function dataUrlToBytes(
  dataUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<Uint8Array> {
  const response = await fetchImpl(dataUrl);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}
