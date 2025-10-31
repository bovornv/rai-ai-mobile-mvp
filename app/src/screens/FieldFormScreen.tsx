import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

type Lang = "th" | "en";
type Crop = "rice" | "durian";
type FieldModel = { id: "single"; name: string; crop: Crop; areaRai: number; plantedAt: string };

const th = {
  add: "เพิ่มแปลง",
  edit: "แก้ไขแปลง",
  name: "ชื่อแปลง",
  crop: "พืช",
  rice: "ข้าว",
  durian: "ทุเรียน",
  area: "ขนาด (ไร่)",
  planted: "วันที่ปลูก",
  save: "บันทึก",
  cancel: "ยกเลิก",
  required: "กรอกข้อมูลให้ครบ",
  areaInvalid: "ระบุขนาดมากกว่า 0",
  saved: "บันทึกแล้ว",
  thBtn: "TH",
  enBtn: "EN",
};

const en = {
  add: "Add Field",
  edit: "Edit Field",
  name: "Field name",
  crop: "Crop",
  rice: "Rice",
  durian: "Durian",
  area: "Area (rai)",
  planted: "Planted date",
  save: "Save",
  cancel: "Cancel",
  required: "Please complete all fields",
  areaInvalid: "Area must be > 0",
  saved: "Saved",
  thBtn: "TH",
  enBtn: "EN",
};

import { useTranslation } from 'react-i18next';

function fmtDate(d: Date, lang: Lang) {
  return lang === "th"
    ? d.toLocaleDateString("th-TH-u-ca-buddhist", { dateStyle: "long" })
    : d.toLocaleDateString("en-US", { dateStyle: "long" });
}

export default function FieldFormScreen({ navigation, route }: any) {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'th' ? 'th' : 'en';
  const t = lang === 'th' ? th : en;

  const [name, setName] = useState("");
  const [crop, setCrop] = useState<Crop>("rice");
  const [area, setArea] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("field");
      if (raw) {
        const f: FieldModel = JSON.parse(raw);
        setName(f.name);
        setCrop(f.crop);
        setArea(String(f.areaRai));
        setDate(new Date(f.plantedAt));
        setEditing(true);
      }
    })();
  }, []);

  async function onSave() {
    if (!name || !area) return Alert.alert(t.required);
    const areaNum = Number(area);
    if (!(areaNum > 0)) return Alert.alert(t.areaInvalid);

    const payload: FieldModel = {
      id: "single",
      name,
      crop,
      areaRai: areaNum,
      plantedAt: date.toISOString(),
    };
    await AsyncStorage.setItem("field", JSON.stringify(payload));
    Alert.alert(t.saved);
    navigation.goBack?.();
  }

  function onChangeDate(_: any, selected?: Date) {
    setShowPicker(false);
    if (selected) setDate(selected);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fbf7", padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f3c22" }}>
          {editing ? t.edit : t.add}
        </Text>
      </View>

      <View style={{ backgroundColor: "white", padding: 14, borderRadius: 14, marginBottom: 10 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t.name}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={lang === "th" ? "เช่น แปลงข้าวหอมมะลิ" : "e.g., Jasmine Rice Field"}
          style={{ backgroundColor: "#f1f5f2", borderRadius: 10, padding: 12, fontSize: 18 }}
        />
      </View>

      <View style={{ backgroundColor: "white", padding: 14, borderRadius: 14, marginBottom: 10 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t.crop}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => setCrop("rice")}
            style={{
              flex: 1,
              backgroundColor: crop === "rice" ? "#1A7F3E" : "#f1f5f2",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: crop === "rice" ? "white" : "#0f3c22", fontWeight: "800" }}>
              {t.rice}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCrop("durian")}
            style={{
              flex: 1,
              backgroundColor: crop === "durian" ? "#1A7F3E" : "#f1f5f2",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: crop === "durian" ? "white" : "#0f3c22", fontWeight: "800" }}>
              {t.durian}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: "white", padding: 14, borderRadius: 14, marginBottom: 10 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t.area}</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={area}
          onChangeText={setArea}
          placeholder={lang === "th" ? "จำนวนไร่" : "Rai"}
          style={{ backgroundColor: "#f1f5f2", borderRadius: 10, padding: 12, fontSize: 18 }}
        />
      </View>

      <View style={{ backgroundColor: "white", padding: 14, borderRadius: 14, marginBottom: 20 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t.planted}</Text>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{ backgroundColor: "#f1f5f2", borderRadius: 10, padding: 12 }}
        >
          <Text style={{ fontSize: 18 }}>{fmtDate(date, lang)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={onSave}
          style={{ flex: 1, backgroundColor: "#1A7F3E", padding: 16, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>{t.save}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack?.()}
          style={{ flex: 1, borderWidth: 2, borderColor: "#1A7F3E", padding: 16, borderRadius: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#1A7F3E", fontWeight: "800", fontSize: 18 }}>{t.cancel}</Text>
        </Pressable>
      </View>
    </View>
  );
}


