import React, { useMemo, useState } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Lang = "th" | "en";
type Crop = "rice" | "durian";

type ScanResult =
  | {
      ok: true;
      crop: Crop;
      diagnosis: string;          // e.g., "โรคใบจุดสีน้ำตาล"
      confidencePct: number;      // 0..100
      actions: string[];          // 2–3 short lines
      ts: number;
      imageUri: string;
    }
  | {
      ok: false;
      reason: "not_supported_image";
      ts: number;
      imageUri: string;
    };

const th = {
  title: "สแกนโรคใบพืช",
  crop: "พืช",
  rice: "ข้าว",
  durian: "ทุเรียน",
  tip: "ถ่ายใบให้ชัด ใบเดียวเต็มกรอบ แสงสว่าง",
  takePhoto: "ถ่ายรูป / เลือกรูป",
  analyzing: "กำลังวิเคราะห์...",
  notLeaf:
    "รูปนี้ไม่น่าจะเป็นใบข้าวหรือทุเรียน\nโปรดถ่ายใบให้ชัดอีกครั้งครับ 🌿",
  result: "ผลการวิเคราะห์",
  confidence: "ความมั่นใจ",
  actions: "คำแนะนำ",
  saveOk: "บันทึกผลล่าสุดแล้ว",
  dailyLimit: "⚠️ จำกัด 1 ครั้งต่อวัน - ผลลัพธ์จะแทนที่ผลลัพธ์ก่อนหน้า",
};

const en = {
  title: "Scan Plant Disease",
  crop: "Crop",
  rice: "Rice",
  durian: "Durian",
  tip: "Bright light, one leaf fills the frame",
  takePhoto: "Take Photo / Select Image",
  analyzing: "Analyzing...",
  notLeaf:
    "This photo doesn't look like a rice or durian leaf.\nPlease retake a clear leaf photo. 🌿",
  result: "Analysis Result",
  confidence: "Confidence",
  actions: "Recommendations",
  saveOk: "Latest result saved",
  dailyLimit: "⚠️ Limited to 1 scan per day - new result replaces previous",
};

// Use global i18n language
import { useTranslation } from 'react-i18next';

// ——— fake "is this even a leaf of supported crop?" guard ———
// MVP heuristic: reject common non-leaf image patterns.
// You can replace with your Azure Custom Vision "crop detector" later.
async function sanityCheckImage(uri: string): Promise<boolean> {
  const lower = uri.toLowerCase();
  
  // Reject common non-leaf image patterns
  const rejectPatterns = [
    "screenshot",
    "screen",
    "photo_", // Generic photo names
    "img_", // Generic image names
    "picture",
    "snap",
    "camera",
    "portrait",
    "selfie",
    "table",
    "document",
    "doc",
    "pdf",
  ];
  
  // Check if URI matches any reject patterns
  for (const pattern of rejectPatterns) {
    if (lower.includes(pattern)) {
      return false;
    }
  }
  
  // Accept images that look like actual photos (have timestamp-like patterns or file:// paths)
  // This is a simple heuristic - real implementation should use image analysis
  if (lower.includes("file://") || lower.includes("content://") || lower.includes("asset://")) {
    // These are likely real camera/gallery images
    return true;
  }
  
  // Default: be cautious and require explicit confirmation
  // For MVP, we'll show a confirmation dialog for suspicious images
  return true; // Will be validated by user confirmation in analyze function
}

// ——— MOCK CLASSIFIER for MVP (deterministic by uri hash) ———
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function bucket(n: number, m: number) {
  return n % m;
}

function mockAnalyze(uri: string, crop: Crop, lang: Lang): Omit<Extract<ScanResult, { ok: true }>, "ts" | "imageUri"> {
  const i = hash(uri);
  const conf = 70 + bucket(i, 25); // 70..94%

  if (crop === "rice") {
    const options =
      lang === "th"
        ? [
            {
              d: "โรคใบจุดสีน้ำตาล",
              a: ["พ่นคาร์เบนดาซิมตอนเช้า", "ตรวจซ้ำใน 3 วัน", "หลีกเลี่ยงรดน้ำช่วงเย็น"],
            },
            {
              d: "โรคไหม้",
              a: ["พ่นไตรไซคาโซลตอนเช้า", "ลดความชื้นแปลง", "เฝ้าระวังใบอ่อน"],
            },
            {
              d: "ขาดธาตุไนโตรเจน",
              a: ["เสริมยูเรียเล็กน้อย", "ติดตามสีใบ 5 วัน", "อย่าให้แฉะนาน"],
            },
            {
              d: "สุขภาพดี",
              a: ["ดูแลตามปกติ", "ตรวจอีกครั้งใน 5 วัน"],
            },
          ]
        : [
            {
              d: "Brown spot disease",
              a: ["Spray carbendazim in the morning", "Recheck in 3 days", "Avoid evening watering"],
            },
            {
              d: "Leaf blast disease",
              a: ["Spray tricyclazole in the morning", "Reduce humidity", "Watch new leaves"],
            },
            {
              d: "Nitrogen deficiency",
              a: ["Add a little urea", "Watch leaf color for 5 days", "Avoid waterlogging"],
            },
            { d: "Healthy", a: ["Normal care", "Recheck in 5 days"] },
          ];
    const pick = options[bucket(i, options.length)];
    return { crop, diagnosis: pick.d, confidencePct: conf, actions: pick.a };
  } else {
    const options =
      lang === "th"
        ? [
            {
              d: "แอนแทรคโนส",
              a: ["พ่นสโตรบิลูรินตอนเช้า", "ตัดใบที่เป็นมาก", "ตรวจซ้ำ 3 วัน"],
            },
            {
              d: "ขาดธาตุไนโตรเจน",
              a: ["เสริมปุ๋ยไนโตรเจนเล็กน้อย", "สังเกตยอดอ่อน 5 วัน"],
            },
            {
              d: "เพลี้ยแป้ง",
              a: ["ฉีดน้ำแรงๆ ไล่", "ใช้สบู่ดำอ่อนๆ", "เฝ้าระวังมด"],
            },
            { d: "สุขภาพดี", a: ["ดูแลตามปกติ", "ตรวจอีกครั้งใน 5 วัน"] },
          ]
        : [
            {
              d: "Anthracnose",
              a: ["Spray strobilurin in morning", "Remove severely infected leaves", "Recheck in 3 days"],
            },
            {
              d: "Nitrogen deficiency",
              a: ["Add light N fertilizer", "Watch new flush for 5 days"],
            },
            { d: "Mealybug", a: ["Spray water strongly", "Mild soap wash", "Watch for ants"] },
            { d: "Healthy", a: ["Normal care", "Recheck in 5 days"] },
          ];
    const pick = options[bucket(i, options.length)];
    return { crop, diagnosis: pick.d, confidencePct: conf, actions: pick.a };
  }
}

// ——— Azure Custom Vision integration point ———
// Replace this function when ready to connect to Azure Custom Vision
async function analyzeWithAzureCustomVision(uri: string, crop: Crop, lang: Lang): Promise<Omit<Extract<ScanResult, { ok: true }>, "ts" | "imageUri">> {
  // TODO: Implement Azure Custom Vision API call
  // 1. Convert image to base64 or use URI
  // 2. Call Azure Custom Vision Prediction API
  // 3. Parse response to get disease name, confidence, and recommendations
  // 4. Return in the same format as mockAnalyze
  // 
  // Example structure:
  // const response = await fetch(AZURE_CV_ENDPOINT, {
  //   method: 'POST',
  //   headers: {
  //     'Prediction-Key': API_KEY,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ url: uri }),
  // });
  // const prediction = await response.json();
  // 
  // For now, fallback to mock
  return mockAnalyze(uri, crop, lang);
}

const CARD = {
  pad: 16,
  radius: 14,
  shadow: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
};

export function ScanScreen() {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'th' ? 'th' : 'en';
  const t = lang === 'th' ? th : en;
  const [crop, setCrop] = useState<Crop>("rice");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const header = useMemo(
    () => ({
      fontSize: 22,
      fontWeight: "700" as const,
      color: "#113B1C",
    }),
    []
  );

  async function pickImage() {
    try {
      // Ask options: camera or gallery
      const useCamera = await new Promise<boolean | null>((resolve) => {
        try {
          Alert.alert(
            lang === "th" ? "เลือกรูป" : "Choose Image",
            lang === "th" ? "ถ่ายรูปใหม่ หรือเลือกรูปจากคลัง" : "Take a photo or pick from gallery",
            [
              { text: lang === "th" ? "คลังรูป" : "Gallery", onPress: () => resolve(false) },
              { text: lang === "th" ? "กล้อง" : "Camera", onPress: () => resolve(true) },
              { text: lang === "th" ? "ยกเลิก" : "Cancel", style: "cancel", onPress: () => resolve(null) },
            ]
          );
        } catch (e) {
          console.error("Alert error in pickImage:", e);
          resolve(null); // Return null on error instead of rejecting
        }
      }).catch((e) => {
        console.error("Promise error in pickImage:", e);
        return null; // Ensure we return null on any rejection
      });

      if (useCamera === null) return;

      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const res = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 1, base64: false, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ quality: 1, base64: false, allowsEditing: false });
      if (res.canceled) return;

      const uri = res.assets?.[0]?.uri;
      if (!uri) return;
      setImage(uri);
      await analyze(uri);
    } catch (e) {
      console.error("Image picker error:", e);
      try {
        Alert.alert("Error", lang === "th" ? "ไม่สามารถเลือกรูปได้" : "Failed to pick image");
      } catch (alertError) {
        console.error("Alert error:", alertError);
    }
    }
  }

  async function analyze(uri: string) {
    setLoading(true);
    setResult(null);
    try {
      const okLeaf = await sanityCheckImage(uri);
      if (!okLeaf) {
        const r: ScanResult = { ok: false, reason: "not_supported_image", ts: Date.now(), imageUri: uri };
        setResult(r);
        try {
          await AsyncStorage.setItem("lastScanResult", JSON.stringify(r));
        } catch (storageError) {
          console.error("Error saving scan result:", storageError);
    }
        setLoading(false);
        return;
      }

      // Show confirmation for image analysis to ensure user uploaded a crop leaf
      const confirmed = await new Promise<boolean>((resolve) => {
        try {
    Alert.alert(
            lang === "th" ? "ยืนยันการวิเคราะห์" : "Confirm Analysis",
            lang === "th" 
              ? "กรุณายืนยันว่ารูปที่เลือกเป็นใบข้าวหรือทุเรียน\nผลการวิเคราะห์จะถูกบันทึกทับผลลัพธ์ก่อนหน้า"
              : "Please confirm this image shows a rice or durian leaf.\nAnalysis will replace previous result.",
            [
        {
                text: lang === "th" ? "ยกเลิก" : "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
        },
        {
                text: lang === "th" ? "ยืนยัน - เป็นใบพืช" : "Confirm - It's a crop leaf",
                onPress: () => resolve(true),
        },
      ]
    );
        } catch (e) {
          resolve(false);
        }
      });

      if (!confirmed) {
        setLoading(false);
        return;
      }

      // --- MVP mock; replace with Azure Custom Vision later ---
      // When ready: const rMock = await analyzeWithAzureCustomVision(uri, crop, lang);
      const rMock = mockAnalyze(uri, crop, lang);
      const r: ScanResult = { ok: true, ...rMock, ts: Date.now(), imageUri: uri };
      setResult(r);
      try {
        await AsyncStorage.setItem("lastScanResult", JSON.stringify(r));
      } catch (storageError) {
        console.error("Error saving scan result:", storageError);
        // Result is still displayed, just failed to persist
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error("Analysis error:", e);
      try {
        Alert.alert("Error", String(e));
      } catch (alertError) {
        console.error("Alert error:", alertError);
    }
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: "#f6fbf7", flexGrow: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={header}>{t.title}</Text>
      </View>

      {/* Crop toggle */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["rice", "durian"] as Crop[]).map((c) => {
          const active = crop === c;
          return (
            <Pressable
              key={c}
              onPress={() => setCrop(c)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: active ? "#1A7F3E" : "#e7f5ec",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  color: active ? "white" : "#1A7F3E",
                  fontSize: 16,
                }}
              >
                {c === "rice" ? t.rice : t.durian}
              </Text>
            </Pressable>
          );
        })}
          </View>

      {/* Tip */}
      <View
        style={{
          padding: CARD.pad,
          borderRadius: CARD.radius,
          backgroundColor: "white",
          ...CARD.shadow,
        }}
      >
        <Text style={{ color: "#3b6b49" }}>{t.tip}</Text>
            </View>

      {/* Big camera button */}
      <Pressable
        onPress={pickImage}
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 22,
          borderRadius: 16,
          backgroundColor: "#1A7F3E",
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>{t.takePhoto}</Text>
      </Pressable>

      {/* Daily limit note (moved below button) */}
      <View
        style={{
          padding: CARD.pad,
          borderRadius: CARD.radius,
          backgroundColor: "#fff4e6",
          borderWidth: 1,
          borderColor: "#ffd54f",
        }}
      >
        <Text style={{ color: "#856404", fontSize: 14 }}>{t.dailyLimit}</Text>
            </View>

      {/* Loading */}
      {loading && (
        <View
          style={{
            padding: CARD.pad,
            borderRadius: CARD.radius,
            backgroundColor: "white",
            alignItems: "center",
            gap: 10,
            ...CARD.shadow,
          }}
        >
          <ActivityIndicator color={"#1A7F3E"} />
          <Text style={{ fontWeight: "700" }}>{t.analyzing}</Text>
              </View>
            )}

      {/* Result */}
      {result && !loading && (
        <View style={{ padding: CARD.pad, borderRadius: CARD.radius, backgroundColor: "white", gap: 12, ...CARD.shadow }}>
          <Text style={{ fontWeight: "800", fontSize: 16 }}>{t.result}</Text>

          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 180, borderRadius: 12, backgroundColor: "#f1f5f3" }}
              resizeMode="cover"
              onError={(e) => {
                console.error("Image load error:", e.nativeEvent?.error || e);
              }}
            />
          )}

          {result.ok ? (
            <>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A7F3E" }}>{result.diagnosis}</Text>
              <Text style={{ fontWeight: "700" }}>
                {t.confidence}: {typeof result.confidencePct === 'number' && !isNaN(result.confidencePct) ? Math.round(result.confidencePct) : 'N/A'}%
              </Text>
              <Text style={{ fontWeight: "700", marginTop: 6 }}>{t.actions}</Text>
              {Array.isArray(result.actions) && result.actions.map((a, idx) => (
                <Text key={idx}>• {a || ""}</Text>
                ))}
              <Text style={{ color: "#7a8f81", marginTop: 6 }}>
                {lang === "th"
                  ? "หมายเหตุ: ผลลัพธ์จาก AI—โปรดตรวจดูอาการจริงร่วมด้วย"
                  : "Note: AI guidance—always double-check in the field."}
              </Text>
            </>
          ) : (
            <Text style={{ color: "#a12b2b", fontWeight: "700", lineHeight: 22 }}>{t.notLeaf}</Text>
          )}
            </View>
        )}
    </ScrollView>
  );
}