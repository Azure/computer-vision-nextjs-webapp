export async function dogOrCat(
  imageUrl: string
): Promise<"dog" | "cat" | null> {
  const {
    AZURE_COMPUTER_VISION_KEY: computerVisionKey,
    AZURE_COMPUTER_VISION_ENDPOINT: computerVisionEndPoint,
  } = process.env;

  const endpoint = `${computerVisionEndPoint}/computervision/imageanalysis:analyze`;

  const url = new URL(endpoint);

  url.searchParams.set("features", "tags");
  url.searchParams.set("language", "en");
  url.searchParams.set("api-version", "2023-02-01-preview");

  // Node SDK does not work, it is outdated, so fetch it is
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ocp-apim-subscription-key": computerVisionKey,
    } as HeadersInit,
    body: JSON.stringify({
      url: imageUrl,
    }),
  });

  const data = await res.json();

  if (!data.tagsResult) {
    throw Error("No results from image.");
  }

  for (const { name } of data.tagsResult.values) {
    if (name.includes("dog")) return "dog";
    if (name.includes("cat")) return "cat";
  }

  return null;
}
