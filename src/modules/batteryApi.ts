import axios from "axios";
import { BATTERY_TYPES_MOCK } from "./mock";
import { Api } from "./generated/BatteryTypeApi";
export interface BatteryAttribute {
  name: string;
  value: string;
  unit?: string | null;
}
export interface BatteryType {
  id: number;
  modelName: string;
  shortDescription: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  capacityMah: number | null;
  nominalVoltageV: number | null;
  likesCount: number;
  attributes?: BatteryAttribute[];
  isMine?: number;
  isLiked?: number;
  modelUrl?: string | null;
  shortDescriptionEn?: string | null;
  rotationX?: number;
  rotationY?: number;
  feedPosition?: number;
  feedBatch?: number;
}
export const isMock = import.meta.env.VITE_BATTERY_TYPE_MOCK === "true";
export const isNative = import.meta.env.VITE_BATTERY_TYPE_NATIVE === "true";
export const api = axios.create({
  baseURL: import.meta.env.VITE_BATTERY_TYPE_API_URL || "/api",
  withCredentials: true,
  timeout: 30000,
});
export const generated = new Api({
  baseURL: (import.meta.env.VITE_BATTERY_TYPE_API_URL || "/api").replace(
    /\/api$/,
    "",
  ),
  withCredentials: !isNative,
  timeout: 30000,
});
export async function getBatteryTypePage(
  minCapacityMah = 0,
  page = 1,
  limit = 24,
): Promise<{
  items: BatteryType[];
  total: number;
  page: number;
  limit: number;
}> {
  if (isMock) {
    const all = BATTERY_TYPES_MOCK.filter(
      (i) => (i.capacityMah ?? 0) >= minCapacityMah,
    );
    return {
      items: all.slice((page - 1) * limit, page * limit),
      total: all.length,
      page,
      limit,
    };
  }
  return (
    await generated.api.batteryTypeControllerGetList({
      minCapacityMah,
      page,
      limit,
    })
  ).data as unknown as {
    items: BatteryType[];
    total: number;
    page: number;
    limit: number;
  };
}
export const getBatteryTypes = async (min = 0) =>
  (await getBatteryTypePage(min)).items;
export async function getFeedItem(
  id?: number,
  next = false,
): Promise<BatteryType | null> {
  if (isMock)
    return (
      BATTERY_TYPES_MOCK.find((i) => i.id === id) ??
      BATTERY_TYPES_MOCK[0] ??
      null
    );
  return (await api.get("/battery_type/feed", { params: { id, next } })).data;
}
export const batteryTypeError = (e: unknown) =>
  axios.isAxiosError(e)
    ? JSON.stringify(e.response?.data?.message ?? e.message)
    : String(e);
