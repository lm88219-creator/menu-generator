export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";

type VisionStatus = "ready" | "review" | "missing";

type VisionField = {
  value: string;
  status: VisionStatus;
  confidence: number;
};

type VisionItem = {
  name: string;
  price: string;
  category: string;
  status: VisionStatus;
  confidence: number;
};

type VisionModelResponse = {
  restaurantName: VisionField;
  phone: VisionField;
  address: VisionField;
  hours: VisionField;
  categories: Array<{ name: string; status: VisionStatus }>;
  items: VisionItem[];
  notes: string[];
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-5.4";

const MENU_VISION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["restaurantName", "phone", "address", "hours", "categories", "items", "notes"],
  properties: {
    restaurantName: {
      type: "object",
      additionalProperties: false,
      required: ["value", "status", "confidence"],
      properties: {
        value: { type: "string" },
        status: { type: "string", enum: ["ready", "review", "missing"] },
        confidence: { type: "number" },
      },
    },
    phone: {
      type: "object",
      additionalProperties: false,
      required: ["value", "status", "confidence"],
      properties: {
        value: { type: "string" },
        status: { type: "string", enum: ["ready", "review", "missing"] },
        confidence: { type: "number" },
      },
    },
    address: {
      type: "object",
      additionalProperties: false,
      required: ["value", "status", "confidence"],
      properties: {
        value: { type: "string" },
        status: { type: "string", enum: ["ready", "review", "missing"] },
        confidence: { type: "number" },
      },
    },
    hours: {
      type: "object",
      additionalProperties: false,
      required: ["value", "status", "confidence"],
      properties: {
        value: { type: "string" },
        status: { type: "string", enum: ["ready", "review", "missing"] },
        confidence: { type: "number" },
      },
    },
    categories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "status"],
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: ["ready", "review", "missing"] },
        },
      },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "price", "category", "status", "confidence"],
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          category: { type: "string" },
          status: { type: "string", enum: ["ready", "review", "missing"] },
          confidence: { type: "number" },
        },
      },
    },
    notes: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

function clampConfidence(value: unknown) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function normalizeField(field: Partial<VisionField> | undefined): VisionField {
  return {
    value: String(field?.value ?? "").trim(),
    status: field?.status === "ready" || field?.status === "review" || field?.status === "missing" ? field.status : "missing",
    confidence: clampConfidence(field?.confidence),
  };
}

function normalizeItem(item: Partial<VisionItem> | undefined, index: number) {
  const name = String(item?.name ?? "").trim();
  const category = String(item?.category ?? "精選菜單").trim() || "精選菜單";
  const price = String(item?.price ?? "").replace(/[^\d.-]/g, "").trim();
  return {
    id: `vision-item-${index + 1}`,
    name,
    price,
    category,
    status: item?.status === "ready" || item?.status === "review" || item?.status === "missing" ? item.status : name ? "review" : "missing",
    confidence: clampConfidence(item?.confidence),
  };
}

function getConfidenceSummary(fields: VisionField[], items: Array<{ confidence: number }>) {
  const values = [...fields.map((field) => field.confidence), ...items.map((item) => item.confidence)].filter((value) => value > 0);
  if (!values.length) return { average: 0, label: "未提供" };
  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return {
    average,
    label: average >= 85 ? "高" : average >= 68 ? "中" : "低",
  };
}

async function callOpenAIVision(imageDataUrl: string, restaurantHint: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("missing_openai_api_key");

  const systemPrompt = [
    "你是餐廳菜單圖片理解助手。",
    "請直接看懂菜單圖片內容，而不是單純 OCR 抓字。",
    "目標是產出可讓使用者匯入表單的候選資料。",
    "請只回傳 JSON schema 需要的內容，不要輸出任何額外說明。",
    "不能憑空捏造。看不清楚時，要把 status 設為 review 或 missing。",
    "restaurantName、phone、address、hours 的 value 若看不清楚可留空字串。",
    "items 要盡量整理成菜名、價格、分類；可以合併被切開的菜名。",
    "category 請優先使用圖片裡明確看到的分類；若沒有清楚分類，可用『精選菜單』或你有把握的通用分類，但若不確定則 status 設為 review。",
    "price 只放數字字串，例如 120；若沒有把握可留空字串。",
    "維持繁體中文輸出。",
  ].join("\n");

  const userPrompt = [
    restaurantHint ? `已知店名提示：${restaurantHint}` : "沒有提供店名提示。",
    "請分析這張餐廳菜單圖片，回傳可供前端顯示與勾選匯入的結構化候選結果。",
  ].join("\n");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      store: false,
      max_output_tokens: 4000,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: userPrompt },
            { type: "input_image", image_url: imageDataUrl, detail: "high" },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "menu_vision_result",
          strict: true,
          schema: MENU_VISION_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai_${response.status}:${errorText}`);
  }

  const json = (await response.json()) as { output_text?: string };
  if (!json.output_text) throw new Error("missing_output_text");
  return JSON.parse(json.output_text) as VisionModelResponse;
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const imageDataUrl = String(body.imageDataUrl ?? "").trim();
    const restaurantHint = String(body.restaurantHint ?? "").trim();

    if (!imageDataUrl.startsWith("data:image/")) {
      return Response.json({ error: "請先上傳菜單圖片" }, { status: 400 });
    }

    const raw = await callOpenAIVision(imageDataUrl, restaurantHint);
    const restaurantName = normalizeField(raw.restaurantName);
    const phone = normalizeField(raw.phone);
    const address = normalizeField(raw.address);
    const hours = normalizeField(raw.hours);
    const menuItems = Array.isArray(raw.items)
      ? raw.items
          .map((item, index) => normalizeItem(item, index))
          .filter((item) => item.name || item.category || item.price)
      : [];

    const confidence = getConfidenceSummary([restaurantName, phone, address, hours], menuItems);
    const warnings: string[] = [];
    if (restaurantName.status !== "ready") warnings.push("餐廳名稱仍建議人工確認後再匯入。");
    if (phone.status === "missing") warnings.push("電話沒有明確辨識到，可能需要手動補上。");
    if (address.status === "missing") warnings.push("地址沒有明確辨識到，若公開頁要顯示地圖記得補上。");
    if (hours.status !== "ready") warnings.push("營業時間可能不完整，匯入前請再檢查一次。");
    if (!menuItems.length) warnings.push("這張圖片沒有整理出可用菜單品項，建議換更清楚的菜單照。");
    if (menuItems.some((item) => item.status === "review")) warnings.push("部分菜名或價格是 AI 推測整理的，請先修正再匯入。");
    if (Array.isArray(raw.notes)) warnings.push(...raw.notes.map((item) => String(item)).filter(Boolean));

    return Response.json({
      sourceLabel: `AI Vision · ${OPENAI_MODEL}`,
      note: "AI 已先整理出可編輯的候選結果。你可以逐項勾選、修改、刪除後，再匯入到表單。",
      menuCount: menuItems.length,
      confidence,
      warnings: Array.from(new Set(warnings)).slice(0, 8),
      fieldStatus: [
        {
          field: "restaurant",
          label: "餐廳名稱",
          value: restaurantName.value,
          filled: Boolean(restaurantName.value),
          confidence: restaurantName.confidence,
          status: restaurantName.status,
        },
        {
          field: "phone",
          label: "電話",
          value: phone.value,
          filled: Boolean(phone.value),
          confidence: phone.confidence,
          status: phone.status,
        },
        {
          field: "address",
          label: "地址",
          value: address.value,
          filled: Boolean(address.value),
          confidence: address.confidence,
          status: address.status,
        },
        {
          field: "hours",
          label: "營業時間",
          value: hours.value,
          filled: Boolean(hours.value),
          confidence: hours.confidence,
          status: hours.status,
        },
      ],
      menuItems,
    });
  } catch (error) {
    console.error("POST /api/menus/vision error:", error);
    const message = error instanceof Error ? error.message : "圖片辨識失敗";
    if (message === "missing_openai_api_key") {
      return Response.json({ error: "尚未設定 OPENAI_API_KEY，請先補上後再使用 AI 菜單辨識。" }, { status: 500 });
    }
    return Response.json({ error: "AI 菜單辨識失敗，請稍後再試。" }, { status: 500 });
  }
}
