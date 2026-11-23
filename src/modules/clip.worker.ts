import {
  AutoTokenizer,
  AutoProcessor,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage,
  env,
} from "@huggingface/transformers";
env.allowLocalModels = false;
env.backends.onnx.wasm!.proxy = false;
const MODEL = "Xenova/clip-vit-base-patch32";
let ready: Promise<any[]> | undefined;
const vectors = new Map<string, number[]>();
function cosine(a: number[], b: number[]) {
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt(aa * bb);
}
self.onmessage = async (
  e: MessageEvent<{
    image: string;
    captions: { id: number; description: string }[];
    threshold: number;
    topK: number;
  }>,
) => {
  try {
    self.postMessage({
      status: "Загрузка модели CLIP и вычисление эмбеддингов…",
    });
    ready ??= Promise.all([
      AutoTokenizer.from_pretrained(MODEL),
      AutoProcessor.from_pretrained(MODEL),
      CLIPTextModelWithProjection.from_pretrained(MODEL, {
        dtype: "q8",
        device: "wasm",
      }),
      CLIPVisionModelWithProjection.from_pretrained(MODEL, {
        dtype: "q8",
        device: "wasm",
      }),
    ]);
    const [tokenizer, processor, textModel, imageModel] = await ready;
    for (const caption of e.data.captions) {
      if (!vectors.has(caption.description)) {
        const output = await textModel(
          await tokenizer(caption.description, {
            padding: true,
            truncation: true,
          }),
        );
        vectors.set(
          caption.description,
          Array.from(output.text_embeds.data) as number[],
        );
      }
    }
    const vision = await imageModel(
      await processor(await RawImage.read(e.data.image)),
    );
    const image = Array.from(vision.image_embeds.data) as number[];
    // Map cosine [-1,1] to similarity [0,1]; keep the raw cosine for calibration.
    const scores = e.data.captions
      .map((c) => {
        const rawCosine = cosine(image, vectors.get(c.description)!);
        return { ...c, rawCosine, score: (1 + rawCosine) / 2 };
      })
      .sort((a, b) => b.score - a.score);
    self.postMessage({
      results: scores
        .filter((c) => c.score >= e.data.threshold)
        .slice(0, e.data.topK),
      scores,
    });
  } catch (error) {
    ready = undefined;
    self.postMessage({ error: String(error) });
  }
};
