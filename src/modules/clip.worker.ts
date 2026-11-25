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
import { CLIP_MODEL as MODEL, clipCacheKey, TextVectors } from "./clipCache";
let ready: Promise<any[]> | undefined;

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
    textVectors: TextVectors;
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
    const vectors = { ...e.data.textVectors };
    for (const caption of e.data.captions) {
      const key = clipCacheKey(caption.description);
      if (!vectors[key]) {
        const output = await textModel(
          await tokenizer(caption.description, {
            padding: true,
            truncation: true,
          }),
        );
        vectors[key] = Array.from(output.text_embeds.data) as number[];
        // Persist each successful text computation even if image decoding fails.
        self.postMessage({ textVectors: { [key]: vectors[key] } });
      }
    }
    const vision = await imageModel(
      await processor(await RawImage.read(e.data.image)),
    );
    const image = Array.from(vision.image_embeds.data) as number[];
    // Map cosine [-1,1] to similarity [0,1]; keep the raw cosine for calibration.
    const scores = e.data.captions
      .map((c) => {
        const rawCosine = cosine(image, vectors[clipCacheKey(c.description)]);
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
