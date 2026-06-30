import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import BackButton from "../components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Flame, Target, Zap, Activity, Dumbbell, Loader2, Star,
  TrendingUp, Apple, ChevronRight, Droplets, Moon, Scale, Award,
  BarChart2, X, Plus, Minus, Check, CheckCheck, AlertCircle, Camera, User
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Sabitlər ────────────────────────────────────────────────────────────────
const CALORIE_GOAL = 2000;
const WATER_GOAL = 8;
const AVATAR_BUCKET = "avatars"; // Supabase Storage-də public bucket adı

// ─── Tarix köməkçiləri (artıq WEEK_MS yoxdur — gün dəyişimi təqvim tarixinə görə) ──
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Supabase əsaslı saxlama (server-side, müştəri başqa cihazdan girsə belə qalır) ──
// client_progress cədvəli: access_code (PK, text) | data (jsonb) | updated_at (timestamptz)
async function loadClientState(accessCode) {
  try {
    const { data, error } = await supabase
      .from("client_progress")
      .select("data")
      .eq("access_code", accessCode.toUpperCase())
      .maybeSingle();
    if (error) { console.error("loadClientState error:", error); return null; }
    return data?.data ?? null;
  } catch (e) {
    console.error("loadClientState exception:", e);
    return null;
  }
}
async function saveClientState(accessCode, state) {
  try {
    const { error } = await supabase
      .from("client_progress")
      .upsert({
        access_code: accessCode.toUpperCase(),
        data: state,
        updated_at: new Date().toISOString(),
      }, { onConflict: "access_code" });
    if (error) console.error("saveClientState error:", error);
  } catch (e) {
    console.error("saveClientState exception:", e);
  }
}

// dayNumber: 1..30 aylıq dövr sayğacı
function getEmptyDayState(dayNumber = 1) {
  return {
    lastResetDate: todayKey(),
    dayNumber,
    stats: { run: 0, walk: 0, workout: 0, bike: 0 },
    totalLogs: 0, streak: 0,
    weekData: [
      { day: "B.e", pts: 0 }, { day: "Ç.a", pts: 0 }, { day: "Ç", pts: 0 },
      { day: "C.a", pts: 0 }, { day: "C", pts: 0 }, { day: "Ş", pts: 0 }, { day: "B", pts: 0 },
    ],
    foodItems: [], calories: 0, macros: { protein: 0, carbs: 0, fat: 0 },
    waterCups: 0, sleepLogs: [], weightLogs: [], unlockedAch: [],
  };
}

// ─── Qida Bazası ──────────────────────────────────────────────────────────────
const FOOD_DB = {
  "alma": { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, name_az: "Alma" },
  "apple": { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, name_az: "Alma" },
  "armud": { kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, name_az: "Armud" },
  "pear": { kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, name_az: "Armud" },
  "banan": { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, name_az: "Banan" },
  "banana": { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, name_az: "Banan" },
  "portağal": { kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, name_az: "Portağal" },
  "naringi": { kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, name_az: "Portağal" },
  "orange": { kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, name_az: "Portağal" },
  "limon": { kcal: 29, protein: 1.1, carbs: 9, fat: 0.3, name_az: "Limon" },
  "lemon": { kcal: 29, protein: 1.1, carbs: 9, fat: 0.3, name_az: "Limon" },
  "üzüm": { kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, name_az: "Üzüm" },
  "uzum": { kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, name_az: "Üzüm" },
  "grape": { kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, name_az: "Üzüm" },
  "çiyələk": { kcal: 33, protein: 0.7, carbs: 8, fat: 0.3, name_az: "Çiyələk" },
  "strawberry": { kcal: 33, protein: 0.7, carbs: 8, fat: 0.3, name_az: "Çiyələk" },
  "gilas": { kcal: 63, protein: 1.1, carbs: 16, fat: 0.2, name_az: "Gilas" },
  "cherry": { kcal: 63, protein: 1.1, carbs: 16, fat: 0.2, name_az: "Gilas" },
  "şeftəli": { kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, name_az: "Şeftəli" },
  "seftali": { kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, name_az: "Şeftəli" },
  "peach": { kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, name_az: "Şeftəli" },
  "ərik": { kcal: 48, protein: 1.4, carbs: 11, fat: 0.4, name_az: "Ərik" },
  "apricot": { kcal: 48, protein: 1.4, carbs: 11, fat: 0.4, name_az: "Ərik" },
  "gavalı": { kcal: 46, protein: 0.7, carbs: 11, fat: 0.3, name_az: "Gavalı" },
  "plum": { kcal: 46, protein: 0.7, carbs: 11, fat: 0.3, name_az: "Gavalı" },
  "qarpız": { kcal: 30, protein: 0.6, carbs: 8, fat: 0.2, name_az: "Qarpız" },
  "karpuz": { kcal: 30, protein: 0.6, carbs: 8, fat: 0.2, name_az: "Qarpız" },
  "watermelon": { kcal: 30, protein: 0.6, carbs: 8, fat: 0.2, name_az: "Qarpız" },
  "yemiş": { kcal: 34, protein: 0.8, carbs: 8, fat: 0.2, name_az: "Yemiş" },
  "kavun": { kcal: 34, protein: 0.8, carbs: 8, fat: 0.2, name_az: "Yemiş" },
  "melon": { kcal: 34, protein: 0.8, carbs: 8, fat: 0.2, name_az: "Yemiş" },
  "ananas": { kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, name_az: "Ananas" },
  "pineapple": { kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, name_az: "Ananas" },
  "mango": { kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, name_az: "Mango" },
  "avokado": { kcal: 160, protein: 2, carbs: 9, fat: 15, name_az: "Avokado" },
  "avocado": { kcal: 160, protein: 2, carbs: 9, fat: 15, name_az: "Avokado" },
  "nar": { kcal: 83, protein: 1.7, carbs: 19, fat: 1.2, name_az: "Nar" },
  "pomegranate": { kcal: 83, protein: 1.7, carbs: 19, fat: 1.2, name_az: "Nar" },
  "kivi": { kcal: 61, protein: 1.1, carbs: 15, fat: 0.5, name_az: "Kivi" },
  "kiwi": { kcal: 61, protein: 1.1, carbs: 15, fat: 0.5, name_az: "Kivi" },
  "xurma": { kcal: 277, protein: 1.8, carbs: 75, fat: 0.2, name_az: "Xurma" },
  "hurma": { kcal: 277, protein: 1.8, carbs: 75, fat: 0.2, name_az: "Xurma" },
  "date": { kcal: 277, protein: 1.8, carbs: 75, fat: 0.2, name_az: "Xurma" },
  "əncir": { kcal: 74, protein: 0.8, carbs: 19, fat: 0.3, name_az: "Əncir" },
  "incir": { kcal: 74, protein: 0.8, carbs: 19, fat: 0.3, name_az: "Əncir" },
  "fig": { kcal: 74, protein: 0.8, carbs: 19, fat: 0.3, name_az: "Əncir" },
  "pomidor": { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, name_az: "Pomidor" },
  "domates": { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, name_az: "Pomidor" },
  "tomato": { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, name_az: "Pomidor" },
  "xiyar": { kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, name_az: "Xiyar" },
  "salatalik": { kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, name_az: "Xiyar" },
  "cucumber": { kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, name_az: "Xiyar" },
  "soğan": { kcal: 40, protein: 1.1, carbs: 9, fat: 0.1, name_az: "Soğan" },
  "onion": { kcal: 40, protein: 1.1, carbs: 9, fat: 0.1, name_az: "Soğan" },
  "sarımsaq": { kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, name_az: "Sarımsaq" },
  "garlic": { kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, name_az: "Sarımsaq" },
  "kartof": { kcal: 77, protein: 2, carbs: 17, fat: 0.1, name_az: "Kartof" },
  "patates": { kcal: 77, protein: 2, carbs: 17, fat: 0.1, name_az: "Kartof" },
  "potato": { kcal: 77, protein: 2, carbs: 17, fat: 0.1, name_az: "Kartof" },
  "yerkökü": { kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, name_az: "Yerkökü" },
  "havuc": { kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, name_az: "Yerkökü" },
  "carrot": { kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, name_az: "Yerkökü" },
  "kələm": { kcal: 25, protein: 1.3, carbs: 6, fat: 0.1, name_az: "Kələm" },
  "lahana": { kcal: 25, protein: 1.3, carbs: 6, fat: 0.1, name_az: "Kələm" },
  "cabbage": { kcal: 25, protein: 1.3, carbs: 6, fat: 0.1, name_az: "Kələm" },
  "ispanaq": { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, name_az: "İspanaq" },
  "spinach": { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, name_az: "İspanaq" },
  "brokkoli": { kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, name_az: "Brokkoli" },
  "broccoli": { kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, name_az: "Brokkoli" },
  "bibər": { kcal: 31, protein: 1, carbs: 6, fat: 0.3, name_az: "Bibər" },
  "pepper": { kcal: 31, protein: 1, carbs: 6, fat: 0.3, name_az: "Bibər" },
  "badımcan": { kcal: 25, protein: 1, carbs: 6, fat: 0.2, name_az: "Badımcan" },
  "patlican": { kcal: 25, protein: 1, carbs: 6, fat: 0.2, name_az: "Badımcan" },
  "eggplant": { kcal: 25, protein: 1, carbs: 6, fat: 0.2, name_az: "Badımcan" },
  "göbələk": { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, name_az: "Göbələk" },
  "mantar": { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, name_az: "Göbələk" },
  "mushroom": { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, name_az: "Göbələk" },
  "qabaq": { kcal: 17, protein: 1.2, carbs: 3.6, fat: 0.1, name_az: "Qabaq" },
  "zucchini": { kcal: 17, protein: 1.2, carbs: 3.6, fat: 0.1, name_az: "Qabaq" },
  "mısır": { kcal: 86, protein: 3.3, carbs: 19, fat: 1.4, name_az: "Qarğıdalı" },
  "corn": { kcal: 86, protein: 3.3, carbs: 19, fat: 1.4, name_az: "Qarğıdalı" },
  "toyuq döşü": { kcal: 165, protein: 31, carbs: 0, fat: 3.6, name_az: "Toyuq döşü" },
  "toyuq": { kcal: 200, protein: 27, carbs: 0, fat: 10, name_az: "Toyuq" },
  "chicken": { kcal: 200, protein: 27, carbs: 0, fat: 10, name_az: "Toyuq" },
  "chicken breast": { kcal: 165, protein: 31, carbs: 0, fat: 3.6, name_az: "Toyuq döşü" },
  "mal əti": { kcal: 250, protein: 26, carbs: 0, fat: 17, name_az: "Mal əti" },
  "beef": { kcal: 250, protein: 26, carbs: 0, fat: 17, name_az: "Mal əti" },
  "dana əti": { kcal: 215, protein: 26, carbs: 0, fat: 12, name_az: "Dana əti" },
  "veal": { kcal: 215, protein: 26, carbs: 0, fat: 12, name_az: "Dana əti" },
  "qoyun əti": { kcal: 294, protein: 25, carbs: 0, fat: 21, name_az: "Qoyun əti" },
  "lamb": { kcal: 294, protein: 25, carbs: 0, fat: 21, name_az: "Qoyun əti" },
  "donuz əti": { kcal: 242, protein: 27, carbs: 0, fat: 14, name_az: "Donuz əti" },
  "pork": { kcal: 242, protein: 27, carbs: 0, fat: 14, name_az: "Donuz əti" },
  "hindi": { kcal: 189, protein: 29, carbs: 0, fat: 7, name_az: "Türkəyən" },
  "turkey": { kcal: 189, protein: 29, carbs: 0, fat: 7, name_az: "Türkəyən" },
  "kolbasa": { kcal: 300, protein: 13, carbs: 2, fat: 27, name_az: "Kolbasa" },
  "sausage": { kcal: 300, protein: 13, carbs: 2, fat: 27, name_az: "Kolbasa" },
  "sucuk": { kcal: 450, protein: 22, carbs: 2, fat: 40, name_az: "Sucuq" },
  "kotlet": { kcal: 220, protein: 18, carbs: 10, fat: 12, name_az: "Kotlet" },
  "somon": { kcal: 208, protein: 20, carbs: 0, fat: 13, name_az: "Somon" },
  "salmon": { kcal: 208, protein: 20, carbs: 0, fat: 13, name_az: "Somon" },
  "tuna": { kcal: 144, protein: 30, carbs: 0, fat: 3, name_az: "Tuna" },
  "cod": { kcal: 82, protein: 18, carbs: 0, fat: 0.7, name_az: "Cod balığı" },
  "krevets": { kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, name_az: "Krevets" },
  "shrimp": { kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, name_az: "Krevets" },
  "karp": { kcal: 127, protein: 18, carbs: 0, fat: 5.6, name_az: "Karp" },
  "nərə": { kcal: 164, protein: 16, carbs: 0, fat: 10, name_az: "Nərə balığı" },
  "sturgeon": { kcal: 164, protein: 16, carbs: 0, fat: 10, name_az: "Nərə balığı" },
  "yumurta": { kcal: 155, protein: 13, carbs: 1.1, fat: 11, name_az: "Yumurta" },
  "egg": { kcal: 155, protein: 13, carbs: 1.1, fat: 11, name_az: "Yumurta" },
  "süd": { kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, name_az: "Süd" },
  "milk": { kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, name_az: "Süd" },
  "yoğurt": { kcal: 59, protein: 3.5, carbs: 4.7, fat: 3.3, name_az: "Yoğurt" },
  "yogurt": { kcal: 59, protein: 3.5, carbs: 4.7, fat: 3.3, name_az: "Yoğurt" },
  "pendir": { kcal: 402, protein: 25, carbs: 1.3, fat: 33, name_az: "Pendir" },
  "cheese": { kcal: 402, protein: 25, carbs: 1.3, fat: 33, name_az: "Pendir" },
  "kəsmik": { kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, name_az: "Kəsmik" },
  "cottage cheese": { kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, name_az: "Kəsmik" },
  "kefir": { kcal: 52, protein: 3.4, carbs: 4, fat: 1, name_az: "Kefir" },
  "qaymaq": { kcal: 195, protein: 2.8, carbs: 3.4, fat: 19, name_az: "Qaymaq" },
  "yağ": { kcal: 717, protein: 0.1, carbs: 0, fat: 81, name_az: "Kərə yağı" },
  "butter": { kcal: 717, protein: 0.1, carbs: 0, fat: 81, name_az: "Kərə yağı" },
  "düyü": { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, name_az: "Düyü (bişmiş)" },
  "rice": { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, name_az: "Düyü (bişmiş)" },
  "makaron": { kcal: 158, protein: 5.8, carbs: 31, fat: 0.9, name_az: "Makaron (bişmiş)" },
  "pasta": { kcal: 158, protein: 5.8, carbs: 31, fat: 0.9, name_az: "Makaron (bişmiş)" },
  "çörək": { kcal: 265, protein: 9, carbs: 49, fat: 3.2, name_az: "Çörək" },
  "ekmek": { kcal: 265, protein: 9, carbs: 49, fat: 3.2, name_az: "Çörək" },
  "bread": { kcal: 265, protein: 9, carbs: 49, fat: 3.2, name_az: "Çörək" },
  "lavaş": { kcal: 275, protein: 9, carbs: 55, fat: 1.5, name_az: "Lavaş" },
  "yulaf": { kcal: 389, protein: 17, carbs: 66, fat: 7, name_az: "Yulaf" },
  "oatmeal": { kcal: 68, protein: 2.4, carbs: 12, fat: 1.4, name_az: "Yulaf (bişmiş)" },
  "oats": { kcal: 389, protein: 17, carbs: 66, fat: 7, name_az: "Yulaf" },
  "bulgur": { kcal: 83, protein: 3.1, carbs: 19, fat: 0.2, name_az: "Bulgur (bişmiş)" },
  "quinoa": { kcal: 120, protein: 4.4, carbs: 22, fat: 1.9, name_az: "Kinoa (bişmiş)" },
  "kinoa": { kcal: 120, protein: 4.4, carbs: 22, fat: 1.9, name_az: "Kinoa (bişmiş)" },
  "lobya": { kcal: 127, protein: 8.7, carbs: 23, fat: 0.5, name_az: "Lobya (bişmiş)" },
  "bean": { kcal: 127, protein: 8.7, carbs: 23, fat: 0.5, name_az: "Lobya (bişmiş)" },
  "noxud": { kcal: 164, protein: 8.9, carbs: 27, fat: 2.6, name_az: "Noxud (bişmiş)" },
  "chickpea": { kcal: 164, protein: 8.9, carbs: 27, fat: 2.6, name_az: "Noxud (bişmiş)" },
  "mərci": { kcal: 116, protein: 9, carbs: 20, fat: 0.4, name_az: "Mərci (bişmiş)" },
  "lentil": { kcal: 116, protein: 9, carbs: 20, fat: 0.4, name_az: "Mərci (bişmiş)" },
  "fındıq": { kcal: 607, protein: 20, carbs: 21, fat: 54, name_az: "Fındıq" },
  "nut": { kcal: 607, protein: 20, carbs: 21, fat: 54, name_az: "Fındıq" },
  "qoz": { kcal: 654, protein: 15, carbs: 14, fat: 65, name_az: "Qoz" },
  "walnut": { kcal: 654, protein: 15, carbs: 14, fat: 65, name_az: "Qoz" },
  "badam": { kcal: 579, protein: 21, carbs: 22, fat: 50, name_az: "Badam" },
  "almond": { kcal: 579, protein: 21, carbs: 22, fat: 50, name_az: "Badam" },
  "fıstıq": { kcal: 567, protein: 26, carbs: 16, fat: 49, name_az: "Fıstıq" },
  "peanut": { kcal: 567, protein: 26, carbs: 16, fat: 49, name_az: "Fıstıq" },
  "kaju": { kcal: 553, protein: 18, carbs: 30, fat: 44, name_az: "Kaju" },
  "cashew": { kcal: 553, protein: 18, carbs: 30, fat: 44, name_az: "Kaju" },
  "zeytun yağı": { kcal: 884, protein: 0, carbs: 0, fat: 100, name_az: "Zeytun yağı" },
  "olive oil": { kcal: 884, protein: 0, carbs: 0, fat: 100, name_az: "Zeytun yağı" },
  "çay": { kcal: 1, protein: 0, carbs: 0.3, fat: 0, name_az: "Çay (şəkərsiz)" },
  "tea": { kcal: 1, protein: 0, carbs: 0.3, fat: 0, name_az: "Çay (şəkərsiz)" },
  "qəhvə": { kcal: 2, protein: 0.3, carbs: 0, fat: 0, name_az: "Qəhvə (şəkərsiz)" },
  "coffee": { kcal: 2, protein: 0.3, carbs: 0, fat: 0, name_az: "Qəhvə (şəkərsiz)" },
  "kola": { kcal: 42, protein: 0, carbs: 11, fat: 0, name_az: "Kola" },
  "cola": { kcal: 42, protein: 0, carbs: 11, fat: 0, name_az: "Kola" },
  "protein kokteyli": { kcal: 120, protein: 24, carbs: 5, fat: 2, name_az: "Protein kokteyli" },
  "protein shake": { kcal: 120, protein: 24, carbs: 5, fat: 2, name_az: "Protein kokteyli" },
  "pizza": { kcal: 266, protein: 11, carbs: 33, fat: 10, name_az: "Pizza" },
  "burger": { kcal: 295, protein: 17, carbs: 24, fat: 14, name_az: "Burger" },
  "hamburger": { kcal: 295, protein: 17, carbs: 24, fat: 14, name_az: "Hamburger" },
  "hot dog": { kcal: 290, protein: 11, carbs: 23, fat: 17, name_az: "Hot dog" },
  "french fries": { kcal: 312, protein: 3.4, carbs: 41, fat: 15, name_az: "Qızardılmış kartof" },
  "çips": { kcal: 536, protein: 7, carbs: 53, fat: 35, name_az: "Çips" },
  "chips": { kcal: 536, protein: 7, carbs: 53, fat: 35, name_az: "Çips" },
  "shawarma": { kcal: 230, protein: 12, carbs: 22, fat: 10, name_az: "Şavarma" },
  "şavarma": { kcal: 230, protein: 12, carbs: 22, fat: 10, name_az: "Şavarma" },
  "doner": { kcal: 230, protein: 12, carbs: 22, fat: 10, name_az: "Dönər" },
  "döner": { kcal: 230, protein: 12, carbs: 22, fat: 10, name_az: "Dönər" },
  "sushi": { kcal: 150, protein: 6, carbs: 28, fat: 1, name_az: "Sushi" },
  "şokolad": { kcal: 546, protein: 5, carbs: 60, fat: 31, name_az: "Şokolad" },
  "chocolate": { kcal: 546, protein: 5, carbs: 60, fat: 31, name_az: "Şokolad" },
  "tort": { kcal: 350, protein: 4, carbs: 50, fat: 15, name_az: "Tort" },
  "cake": { kcal: 350, protein: 4, carbs: 50, fat: 15, name_az: "Tort" },
  "cookie": { kcal: 450, protein: 7, carbs: 65, fat: 20, name_az: "Biskvit" },
  "dondurma": { kcal: 207, protein: 3.5, carbs: 24, fat: 11, name_az: "Dondurma" },
  "ice cream": { kcal: 207, protein: 3.5, carbs: 24, fat: 11, name_az: "Dondurma" },
  "bal": { kcal: 304, protein: 0.3, carbs: 82, fat: 0, name_az: "Bal" },
  "honey": { kcal: 304, protein: 0.3, carbs: 82, fat: 0, name_az: "Bal" },
  "müsli": { kcal: 380, protein: 10, carbs: 65, fat: 8, name_az: "Müsli" },
  "granola": { kcal: 450, protein: 10, carbs: 65, fat: 18, name_az: "Granola" },
  "plov": { kcal: 180, protein: 8, carbs: 22, fat: 6, name_az: "Plov" },
  "dolma": { kcal: 140, protein: 8, carbs: 12, fat: 6, name_az: "Dolma" },
  "düşbərə": { kcal: 120, protein: 7, carbs: 14, fat: 4, name_az: "Düşbərə" },
  "dushbara": { kcal: 120, protein: 7, carbs: 14, fat: 4, name_az: "Düşbərə" },
  "bozbash": { kcal: 95, protein: 7, carbs: 8, fat: 4, name_az: "Bozbash" },
  "levengi": { kcal: 210, protein: 18, carbs: 8, fat: 12, name_az: "Levengi" },
  "xəngəl": { kcal: 195, protein: 9, carbs: 28, fat: 5, name_az: "Xəngəl" },
  "kuku": { kcal: 185, protein: 10, carbs: 6, fat: 14, name_az: "Kükü" },
  "küftə": { kcal: 220, protein: 16, carbs: 10, fat: 13, name_az: "Küftə" },
  "lyulya": { kcal: 280, protein: 18, carbs: 4, fat: 22, name_az: "Lyulya kabab" },
  "kabab": { kcal: 260, protein: 20, carbs: 2, fat: 19, name_az: "Kabab" },
  "lahmacun": { kcal: 270, protein: 12, carbs: 35, fat: 9, name_az: "Lahmacun" },
  "pide": { kcal: 260, protein: 10, carbs: 42, fat: 6, name_az: "Pide" },
  "hummus": { kcal: 166, protein: 8, carbs: 14, fat: 10, name_az: "Hummus" },
  "falafel": { kcal: 333, protein: 13, carbs: 32, fat: 18, name_az: "Falafel" },
};

function lookupFood(query, qty = 100) {
  const q = query.toLowerCase().trim();
  if (FOOD_DB[q]) {
    const f = FOOD_DB[q];
    const factor = qty / 100;
    return { name_az: f.name_az, kcal: Math.round(f.kcal * factor), protein: Math.round(f.protein * factor), carbs: Math.round(f.carbs * factor), fat: Math.round(f.fat * factor) };
  }
  const partial = Object.keys(FOOD_DB).find((k) => k.includes(q) || q.includes(k));
  if (partial) {
    const f = FOOD_DB[partial];
    const factor = qty / 100;
    return { name_az: f.name_az, kcal: Math.round(f.kcal * factor), protein: Math.round(f.protein * factor), carbs: Math.round(f.carbs * factor), fat: Math.round(f.fat * factor) };
  }
  return null;
}

const ACHIEVEMENTS = [
  { id: "first_log",   icon: "🎯", title: "İlk addım",     desc: "İlk məşqini qeyd etdin",          condition: (s) => s.totalLogs >= 1 },
  { id: "water_hero",  icon: "💧", title: "Su qəhrəmanı",  desc: "Gündəlik su hədəfini tamamladın", condition: (s) => s.waterCups >= WATER_GOAL },
  { id: "cal_goal",    icon: "🍎", title: "Qida ustası",   desc: "Kalori hədəfinə çatdın",          condition: (s) => s.calories >= 1500 },
  { id: "run_5k",      icon: "🏃", title: "5K döyüşçüsü", desc: "5km+ qaçdın",                     condition: (s) => s.run >= 5 },
  { id: "streak_3",    icon: "🔥", title: "Alovlu seriya", desc: "3 gün ardıcıl məşq etdin",        condition: (s) => s.streak >= 3 },
  { id: "sleep_champ", icon: "😴", title: "Yuxu çempionu",desc: "8 saat yuxu qeyd etdin",           condition: (s) => s.sleepHours >= 8 },
  { id: "weight_log",  icon: "⚖️", title: "İzləyici",     desc: "Çəkini qeyd etdin",               condition: (s) => s.weightLogs >= 1 },
  { id: "all_rounder", icon: "🏆", title: "Hamısında",    desc: "Bütün sistemlərdən istifadə etdin",condition: (s) => s.totalLogs >= 1 && s.waterCups >= 1 && s.calories >= 100 && s.sleepHours >= 1 && s.weightLogs >= 1 },
];

// ─── Köməkçi komponentlər ─────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, color = "text-zinc-400" }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="p-1.5 rounded-lg bg-white/5">
        <Icon size={15} className={color} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{label}</span>
    </div>
  );
}

function StatCard({ label, value, unit, color = "text-white", icon: Icon, iconColor = "text-zinc-600", valueClassName = "" }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.12)" }}
      transition={{ duration: 0.15 }}
      className="bg-zinc-900/70 p-4 rounded-2xl border border-white/6 flex flex-col gap-2 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
        {Icon && <Icon size={14} className={iconColor} />}
      </div>
      <span className={`${valueClassName || "text-3xl"} font-black tracking-tight ${color} truncate`}>
        {value}
        {unit && <span className="text-sm font-normal text-zinc-500 ml-1.5">{unit}</span>}
      </span>
    </motion.div>
  );
}

function capitalizeName(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("az") + w.slice(1).toLocaleLowerCase("az"))
    .join(" ");
}

function InputField({ placeholder, value, onChange, onKeyDown, type = "text", className = "" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={`bg-black/60 p-4 rounded-xl border border-zinc-800 focus:border-emerald-500/70 focus:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition-all duration-200 outline-none text-white text-base placeholder:text-zinc-600 w-full ${className}`}
    />
  );
}

// ─── Profil Şəkli Komponenti ───────────────────────────────────────────────────
function AvatarUploader({ avatarUrl, uploading, onUpload, name }) {
  const fileInputRef = useRef(null);
  const initial = (name || "?").trim().charAt(0).toLocaleUpperCase("az");

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onUpload}
      />
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Profil şəklini dəyiş"
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-white/10 bg-zinc-900 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 transition-all duration-200 hover:border-emerald-500/40"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profil şəkli" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl sm:text-5xl font-black text-zinc-600">{initial || <User size={36} />}</span>
        )}

        {/* Yükləmə overlay-i */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <Loader2 size={26} className="animate-spin text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kamera nişanı */}
        {!uploading && (
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-tl-xl flex items-center justify-center shadow-lg shadow-black/40">
            <Camera size={16} className="text-black" strokeWidth={2.5} />
          </div>
        )}
      </motion.button>
    </div>
  );
}

// ─── Əsas Komponent ───────────────────────────────────────────────────────────
export default function ClientView() {
  const [code, setCode]       = useState("");
  const [client, setClient]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false); // serverə yazılarkən kiçik indikator üçün
  const saveTimerRef = useRef(null);

  // Profil şəkli
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // YENİ: weekStartedAt əvəzinə tarix-əsaslı izləmə
  const [lastResetDate, setLastResetDate] = useState(null); // "YYYY-MM-DD"
  const [dayNumber, setDayNumber] = useState(1);             // 1..30 aylıq dövr
  const [weekSummary, setWeekSummary] = useState(null);      // gün dəyişəndə xülasə modalı

  // Məşq
  const [stats, setStats]   = useState({ run: 0, walk: 0, workout: 0, bike: 0 });
  const [logs, setLogs]     = useState({ run: "", walk: "", workout: "", bike: "" });
  const [isLogging, setIsLogging]   = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [totalLogs, setTotalLogs]   = useState(0);
  const [logError, setLogError] = useState(false);

  // Streak + chart
  const [streak, setStreak] = useState(0);
  const [weekData, setWeekData] = useState([
    { day: "B.e", pts: 0 }, { day: "Ç.a", pts: 0 }, { day: "Ç", pts: 0 },
    { day: "C.a", pts: 0 }, { day: "C", pts: 0 }, { day: "Ş", pts: 0 }, { day: "B", pts: 0 },
  ]);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Qida
  const [foodItems, setFoodItems] = useState([]);
  const [food, setFood]           = useState("");
  const [foodQty, setFoodQty]     = useState("100");
  const [calories, setCalories]   = useState(0);
  const [macros, setMacros]       = useState({ protein: 0, carbs: 0, fat: 0 });
  const [foodError, setFoodError] = useState("");

  // Su
  const [waterCups, setWaterCups] = useState(0);

  // Yuxu
  const [sleepHours, setSleepHours]   = useState("");
  const [sleepQuality, setSleepQuality] = useState(null);
  const [sleepLogs, setSleepLogs]     = useState([]);
  const [sleepInput, setSleepInput]   = useState(false);

  // Bədən ölçüləri
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput]   = useState("");
  const [weightLogs, setWeightLogs]   = useState([]);
  const [showBodyForm, setShowBodyForm] = useState(false);

  // Achievements
  const [unlockedAch, setUnlockedAch] = useState([]);
  const [newAch, setNewAch]           = useState(null);

  // Tab
  const [activeTab, setActiveTab] = useState("workout");

  // Bütün state-i bir yerdən tətbiq edən köməkçi
  const applyState = (s) => {
    setLastResetDate(s.lastResetDate);
    setDayNumber(s.dayNumber ?? 1);
    setStats(s.stats); setTotalLogs(s.totalLogs); setStreak(s.streak);
    setWeekData(s.weekData); setFoodItems(s.foodItems); setCalories(s.calories);
    setMacros(s.macros); setWaterCups(s.waterCups); setSleepLogs(s.sleepLogs);
    setWeightLogs(s.weightLogs); setUnlockedAch(s.unlockedAch);
  };

  // ─── Profil şəkli — client yükləndikdə mövcud avatarı tətbiq et ────────────
  useEffect(() => {
    setAvatarUrl(client?.avatar_url || null);
  }, [client?.access_code, client?.avatar_url]);

  // ─── Profil şəkli yükləmə — Supabase Storage + clients cədvəlinə yazma ──────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Yalnız şəkil faylı yükləyə bilərsən.");
      setTimeout(() => setAvatarError(""), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Şəkil 5MB-dan kiçik olmalıdır.");
      setTimeout(() => setAvatarError(""), 3000);
      return;
    }

    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${client.access_code.toUpperCase()}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Public URL alınmadı");

      const { error: updateError } = await supabase
        .from("clients")
        .update({ avatar_url: publicUrl })
        .eq("access_code", client.access_code.toUpperCase());

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setClient((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (err) {
      console.error("handleAvatarUpload error:", err);
      setAvatarError("Şəkil yüklənmədi. Yenidən cəhd et.");
      setTimeout(() => setAvatarError(""), 3500);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // ─── Hydration — Supabase-dən yüklə, təqvim tarixinə görə gün sıfırlanması ──
  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    (async () => {
      const saved = await loadClientState(client.access_code);
      if (cancelled) return;
      const today = todayKey();

      if (!saved || !saved.lastResetDate) {
        const fresh = getEmptyDayState(1);
        applyState(fresh);
        setWeekSummary(null);
        setHydrated(true);
        return;
      }

      if (saved.lastResetDate !== today) {
        let nextDay = (saved.dayNumber || 1) + 1;
        if (nextDay > 30) nextDay = 1;

        setWeekSummary({
          pts: Math.round((saved.stats?.run||0) + (saved.stats?.walk||0)*0.5 + (saved.stats?.workout||0)*5 + (saved.stats?.bike||0)*0.4),
          calories: saved.calories || 0,
          waterCups: saved.waterCups || 0,
          achCount: (saved.unlockedAch || []).length,
        });

        const fresh = getEmptyDayState(nextDay);
        fresh.streak = saved.streak || 0;
        fresh.unlockedAch = saved.unlockedAch || [];
        fresh.weightLogs = saved.weightLogs || [];
        fresh.totalLogs = saved.totalLogs || 0;
        applyState(fresh);
      } else {
        applyState({
          lastResetDate: saved.lastResetDate,
          dayNumber: saved.dayNumber ?? 1,
          stats: saved.stats ?? { run: 0, walk: 0, workout: 0, bike: 0 },
          totalLogs: saved.totalLogs ?? 0,
          streak: saved.streak ?? 0,
          weekData: saved.weekData ?? getEmptyDayState(1).weekData,
          foodItems: saved.foodItems ?? [],
          calories: saved.calories ?? 0,
          macros: saved.macros ?? { protein: 0, carbs: 0, fat: 0 },
          waterCups: saved.waterCups ?? 0,
          sleepLogs: saved.sleepLogs ?? [],
          weightLogs: saved.weightLogs ?? [],
          unlockedAch: saved.unlockedAch ?? [],
        });
        setWeekSummary(null);
      }
      setHydrated(true);
    })();

    return () => { cancelled = true; };
  }, [client]);

  // ─── Saxlama — Supabase-ə debounce ilə yazır (hər dəyişiklikdə deyil, 700ms gecikmə ilə) ──
  useEffect(() => {
    if (!client || !hydrated || !lastResetDate) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncing(true);
    saveTimerRef.current = setTimeout(async () => {
      await saveClientState(client.access_code, {
        lastResetDate, dayNumber, stats, totalLogs, streak, weekData,
        foodItems, calories, macros, waterCups, sleepLogs, weightLogs, unlockedAch
      });
      setSyncing(false);
    }, 700);
    return () => clearTimeout(saveTimerRef.current);
  }, [client, hydrated, lastResetDate, dayNumber, stats, totalLogs, streak, weekData, foodItems, calories, macros, waterCups, sleepLogs, weightLogs, unlockedAch]);

  // ─── Achievement ─────────────────────────────────────────────────────────────
  const checkAchievements = (state) => {
    ACHIEVEMENTS.forEach((ach) => {
      if (!unlockedAch.includes(ach.id) && ach.condition(state)) {
        setUnlockedAch((prev) => [...prev, ach.id]);
        setNewAch(ach);
        setTimeout(() => setNewAch(null), 3000);
      }
    });
  };
  const getCurrentState = (overrides={}) => ({ totalLogs, waterCups, calories, run: stats.run, streak, sleepHours: sleepLogs[0]?.hours||0, weightLogs: weightLogs.length, ...overrides });

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  const fetchClientData = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").eq("access_code", code.toUpperCase()).single();
    if (data) setClient(data); else setShowError(true);
    setLoading(false);
  };

  // ─── Məşq logu ────────────────────────────────────────────────────
  const handleLog = () => {
    const hasAnyValue = Object.values(logs).some((v) => v !== "" && Number(v) > 0);
    if (!hasAnyValue) {
      setLogError(true);
      setTimeout(() => setLogError(false), 3000);
      return;
    }

    setIsLogging(true);
    setLogError(false);
    setTimeout(() => {
      const newStats = {
        run:     stats.run     + (Number(logs.run)||0),
        walk:    stats.walk    + (Number(logs.walk)||0),
        workout: stats.workout + (Number(logs.workout)||0),
        bike:    stats.bike    + (Number(logs.bike)||0),
      };
      setStats(newStats);
      setLogs({ run: "", walk: "", workout: "", bike: "" });

      const newTotal = totalLogs + 1;
      setTotalLogs(newTotal);
      const newStreak = streak + 1;
      setStreak(newStreak);

      const pts = newStats.run + newStats.walk*0.5 + newStats.workout*5 + newStats.bike*0.4;
      setWeekData((prev) => prev.map((d, i) => i===todayIdx ? {...d, pts: Math.round(pts)} : d));

      const res = pts>100 ? {msg:"Zirvədəsən!", stars:3} : pts>50 ? {msg:"Tempin əladır!", stars:2} : {msg:"Başlanğıc!", stars:1};
      setShowResult(res);
      setIsLogging(false);
      setTimeout(() => setShowResult(null), 3000);

      checkAchievements(getCurrentState({ run: newStats.run, totalLogs: newTotal, streak: newStreak }));
    }, 1500);
  };

  // ─── Qida ────────────────────────────────────────────────────────────────────
  const calculateCalories = () => {
    if (!food.trim()) return;
    setFoodError("");
    const qty = Number(foodQty)||100;
    const result = lookupFood(food, qty);
    if (!result) { setFoodError(`"${food}" tapılmadı. Az., türk və ya ing. adı ilə yaz.`); return; }
    const entry = { name: result.name_az, qty, ...result };
    const newCal = calories + entry.kcal;
    setFoodItems((prev) => [...prev, entry]);
    setCalories(newCal);
    setMacros((prev) => ({ protein: prev.protein+entry.protein, carbs: prev.carbs+entry.carbs, fat: prev.fat+entry.fat }));
    setFood("");
    checkAchievements(getCurrentState({ calories: newCal }));
  };

  const removeFood = (idx) => {
    const f = foodItems[idx];
    setCalories((c) => c - f.kcal);
    setMacros((m) => ({ protein: m.protein-f.protein, carbs: m.carbs-f.carbs, fat: m.fat-f.fat }));
    setFoodItems((prev) => prev.filter((_,i) => i!==idx));
  };

  // ─── Su ──────────────────────────────────────────────────────────────────────
  const addWater = () => {
    const newCups = waterCups + 1;
    setWaterCups(newCups);
    checkAchievements(getCurrentState({ waterCups: newCups }));
  };

  // ─── Yuxu ────────────────────────────────────────────────────────────────────
  const logSleep = () => {
    if (!sleepHours || !sleepQuality) return;
    const entry = { hours: Number(sleepHours), quality: sleepQuality, date: new Date().toLocaleDateString("az-AZ") };
    const newLogs = [entry, ...sleepLogs.slice(0,6)];
    setSleepLogs(newLogs); setSleepHours(""); setSleepQuality(null); setSleepInput(false);
    checkAchievements(getCurrentState({ sleepHours: entry.hours }));
  };

  // ─── Bədən ───────────────────────────────────────────────────────────────────
  const logBody = () => {
    if (!weightInput) return;
    const entry = { weight: Number(weightInput), waist: waistInput ? Number(waistInput) : null, date: new Date().toLocaleDateString("az-AZ") };
    const newLogs = [entry, ...weightLogs.slice(0,13)];
    setWeightLogs(newLogs); setWeightInput(""); setWaistInput(""); setShowBodyForm(false);
    checkAchievements(getCurrentState({ weightLogs: newLogs.length }));
  };

  // ─── Login ekranı ─────────────────────────────────────────────────────────────
  if (!client) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-5 selection:bg-emerald-500/30">
        <BackButton />
        <AnimatePresence>
          {showError && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              onClick={() => setShowError(false)}>
              <motion.div initial={{scale:0.85,y:20}} animate={{scale:1,y:0}} exit={{scale:0.85,y:20}}
                className="bg-zinc-900 border border-red-500/30 p-8 rounded-3xl w-full max-w-xs text-center"
                onClick={e=>e.stopPropagation()}>
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <h3 className="text-white font-black text-xl mb-1">Kod tapılmadı!</h3>
                <p className="text-zinc-500 text-sm mb-5">Zəhmət olmasa düzgün kodu daxil edin.</p>
                <button onClick={() => setShowError(false)}
                  className="w-full bg-red-500 py-3.5 rounded-2xl font-black text-white text-base hover:bg-red-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 transition-all">
                  Yenidən cəhd et
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} transition={{type:"spring",stiffness:200,damping:20}}
          className="w-full max-w-sm">
          {/* Logo / branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{scale:0}} animate={{scale:1}} transition={{delay:0.1,type:"spring",stiffness:300}}
              className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={36} className="text-emerald-400" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tight">FitTrack</h1>
            <p className="text-zinc-500 text-sm mt-1">Hər gün bir addım, hər həftə bir irəliləyiş</p>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/8">
            <p className="text-zinc-400 text-sm mb-4 font-medium">Müştəri kodu daxil edin</p>
            <InputField
              placeholder="Kod (məs: ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key==="Enter" && fetchClientData()}
              className="text-center uppercase tracking-[0.2em] text-lg font-bold mb-3"
            />
            <button onClick={fetchClientData}
              className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg hover:bg-emerald-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all duration-150 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <>Daxil ol <ChevronRight size={20} /></>}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Kalori progress ─────────────────────────────────────────────────────────
  const calPct  = Math.min((calories/CALORIE_GOAL)*100, 100);
  const calOver = calories > CALORIE_GOAL;
  const totalPts = Math.round(stats.run + stats.walk*0.5 + stats.workout*5 + stats.bike*0.4);

  const tabs = [
    { id:"workout",  label:"Məşq",    icon:Dumbbell },
    { id:"calorie",  label:"Qida",    icon:Apple },
    { id:"water",    label:"Su",      icon:Droplets },
    { id:"sleep",    label:"Yuxu",    icon:Moon },
    { id:"body",     label:"Ölçü",    icon:Scale },
    { id:"progress", label:"Analiz",  icon:BarChart2 },
    { id:"badges",   label:"Medallər",icon:Award },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/25">
      <BackButton />

      {/* Workout result popup */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
            <motion.div initial={{scale:0.4,rotate:-10}} animate={{scale:1,rotate:0}} transition={{type:"spring",stiffness:300,damping:20}}
              className="bg-zinc-900 border border-emerald-500/40 p-10 rounded-3xl text-center">
              <div className="flex gap-3 justify-center mb-5">
                {[...Array(showResult.stars)].map((_,i) => (
                  <motion.div key={i} initial={{scale:0,rotate:-30}} animate={{scale:1,rotate:0}} transition={{delay:i*0.1,type:"spring"}}>
                    <Star size={52} className="text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <h2 className="text-3xl font-black text-white">{showResult.msg}</h2>
              <p className="text-zinc-500 text-sm mt-2">Məşq uğurla qeyd edildi!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement popup — düz ortada, arxa fon blur */}
      <AnimatePresence>
        {newAch && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4">
            <motion.div initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.6,opacity:0}} transition={{type:"spring",stiffness:300,damping:22}}
              className="bg-zinc-900 border border-yellow-500/40 px-6 py-7 rounded-3xl flex flex-col items-center gap-3 shadow-2xl max-w-xs w-full text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-4xl">{newAch.icon}</div>
              <div>
                <p className="text-yellow-400 font-black text-lg">{newAch.title} açıldı!</p>
                <p className="text-zinc-400 text-sm mt-1">{newAch.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gün dəyişimi xülasə modalı */}
      <AnimatePresence>
        {weekSummary && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
            <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} transition={{type:"spring"}}
              className="bg-zinc-900 border border-emerald-500/30 p-7 rounded-3xl w-full max-w-sm text-center">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:"spring"}}>
                <Trophy size={44} className="text-yellow-400 mx-auto mb-3" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-1">Gün tamamlandı!</h2>
              <p className="text-zinc-500 text-sm mb-5">{dayNumber}-ci günə hazırsan?</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  {val:weekSummary.pts, label:"Xal", color:"text-emerald-400"},
                  {val:weekSummary.waterCups, label:"Stəkan su", color:"text-blue-400"},
                  {val:weekSummary.calories, label:"Kcal (son gün)", color:"text-white"},
                  {val:weekSummary.achCount, label:"Medal", color:"text-yellow-400"},
                ].map(item => (
                  <div key={item.label} className="bg-zinc-800/60 rounded-2xl p-4">
                    <p className={`text-2xl font-black ${item.color}`}>{item.val}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setWeekSummary(null)}
                className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-base hover:bg-emerald-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all">
                Yeni günə başla 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 pt-16 pb-28 space-y-5">

        {/* Header */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <AvatarUploader
              avatarUrl={avatarUrl}
              uploading={uploadingAvatar}
              onUpload={handleAvatarUpload}
              name={client.full_name}
            />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent tracking-tight truncate">
                Salam, {capitalizeName(client.full_name.split(" ")[0])}! 👋
              </h1>
              <p className="text-zinc-500 text-base mt-1">Bugün nə etdin?</p>
              <p className="text-zinc-700 text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Target size={12} className="text-zinc-700 flex-shrink-0" />
                <span>Ay dövrü: {dayNumber}/30-cu gün — saat 00:00-da yeni gün başlayır</span>
                {syncing && <span className="text-zinc-600">· saxlanılır...</span>}
              </p>
              <AnimatePresence>
                {avatarError && (
                  <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    className="text-red-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {avatarError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          {streak > 0 && (
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring"}}
              className="flex flex-col items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-2xl flex-shrink-0">
              <Flame size={20} className="text-orange-400" />
              <span className="text-orange-400 font-black text-base leading-none">{streak}</span>
              <span className="text-orange-500/70 text-xs font-medium">gün</span>
            </motion.div>
          )}
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab===t.id;
            return (
              <motion.button key={t.id} onClick={() => setActiveTab(t.id)}
                whileHover={{scale:1.03}} whileTap={{scale:0.96}}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-900/80 text-zinc-400 border border-white/6 hover:border-white/12 hover:text-zinc-300"
                }`}>
                <Icon size={13} />
                <span>{t.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ═══════════════════ TAB: MƏŞQ ═══════════════════ */}
        {activeTab==="workout" && (
          <motion.div key="workout" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Qaçış"     value={stats.run}     unit="km"   icon={Activity}  iconColor="text-emerald-600" />
              <StatCard label="Yürüş"     value={stats.walk}    unit="km"   icon={TrendingUp} iconColor="text-blue-600" />
              <StatCard label="Məşq"      value={stats.workout} unit="saat" color="text-emerald-400" icon={Zap} iconColor="text-emerald-600" />
              <StatCard label="Velosiped" value={stats.bike}    unit="km"   icon={Target}    iconColor="text-purple-600" />
            </div>

            {/* Log form */}
            <div className={`bg-zinc-900/50 p-5 rounded-3xl border transition-colors duration-300 ${logError ? "border-red-500/40" : "border-white/6"}`}>
              <SectionTitle icon={TrendingUp} label="Bugünkü Məşqi Qeyd Et" color="text-emerald-400" />

              <AnimatePresence>
                {logError && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mb-3">
                    <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm font-semibold">Ən az 1 xanaya dəyər yazın!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { key:"run",     p:"🏃 Qaçış (km)",    icon:"🏃" },
                  { key:"walk",    p:"🚶 Yürüş (km)",    icon:"🚶" },
                  { key:"workout", p:"💪 Məşq (saat)",   icon:"💪" },
                  { key:"bike",    p:"🚴 Velo (km)",     icon:"🚴" },
                ].map((item) => (
                  <div key={item.key} className="relative">
                    <input type="number" placeholder={item.p}
                      className="w-full bg-black/60 p-4 pt-3 pb-3 rounded-xl border border-zinc-800 focus:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 transition-all duration-200 outline-none text-white text-base placeholder:text-zinc-600"
                      value={logs[item.key]}
                      onChange={(e) => { setLogs({...logs,[item.key]:e.target.value}); setLogError(false); }}
                    />
                  </div>
                ))}
              </div>
              <motion.button onClick={handleLog} whileTap={{scale:0.97}}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-base hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all duration-200 flex items-center justify-center gap-2">
                {isLogging ? <Loader2 size={20} className="animate-spin" /> : <><Check size={18} /> Sistemi Yenilə</>}
              </motion.button>
            </div>

            {/* Aktiv plan */}
            {client.profile_data?.length > 0 && (
              <div className="space-y-3">
                <SectionTitle icon={Dumbbell} label="Aktiv Məşq Planın" color="text-purple-400" />
                {client.profile_data.map((f, i) => (
                  <motion.div key={i} whileHover={{x:6}} whileTap={{scale:0.99}}
                    className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-zinc-700">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCheck size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">{f.label}</p>
                        <p className="font-bold text-base text-white">{f.value}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-zinc-700" size={18} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ TAB: QİDA ═══════════════════ */}
        {activeTab==="calorie" && (
          <motion.div key="calorie" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">

            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Günlük Kalori</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black tracking-tight ${calOver?"text-red-400":"text-white"}`}>{calories}</span>
                    <span className="text-zinc-500 text-base">/ {CALORIE_GOAL} kcal</span>
                  </div>
                </div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${
                  calOver ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                  calPct>80 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                  "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {calOver ? `+${calories-CALORIE_GOAL} kcal` : `${CALORIE_GOAL-calories} kcal qalıb`}
                </span>
              </div>
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                <motion.div initial={{width:0}} animate={{width:`${calPct}%`}} transition={{duration:0.6,ease:"easeOut"}}
                  className={`h-full rounded-full ${calOver?"bg-red-500":calPct>80?"bg-yellow-400":"bg-emerald-500"}`} />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {label:"Zülal",color:"text-blue-400",bg:"bg-blue-500/10 border-blue-500/15",val:macros.protein},
                  {label:"Karbohidrat",color:"text-yellow-400",bg:"bg-yellow-500/10 border-yellow-500/15",val:macros.carbs},
                  {label:"Yağ",color:"text-orange-400",bg:"bg-orange-500/10 border-orange-500/15",val:macros.fat},
                ].map((m) => (
                  <div key={m.label} className={`rounded-2xl p-3 text-center border ${m.bg}`}>
                    <p className={`text-xl font-black ${m.color}`}>{m.val}g</p>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-3">
              <SectionTitle icon={Apple} label="Qida Əlavə Et" color="text-green-400" />
              <div className="flex gap-2">
                <InputField
                  placeholder="Qida adı (alma, toyuq döşü...)"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  onKeyDown={(e) => e.key==="Enter" && calculateCalories()}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <input type="number"
                    className="w-16 bg-black/60 p-3 rounded-xl border border-zinc-800 focus:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 outline-none text-white text-base text-center"
                    placeholder="100" value={foodQty} onChange={(e) => setFoodQty(e.target.value)} />
                  <span className="text-zinc-600 text-sm font-medium">q</span>
                </div>
              </div>
              <AnimatePresence>
                {foodError && (
                  <motion.p initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-red-400 text-sm flex items-center gap-1.5">
                    <AlertCircle size={14} /> {foodError}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button onClick={calculateCalories} whileTap={{scale:0.97}}
                className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-base hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Əlavə Et
              </motion.button>
            </div>

            <AnimatePresence>
              {foodItems.length>0 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-2">
                  <SectionTitle icon={Activity} label={`Bu gün yediklərin (${foodItems.length})`} />
                  {foodItems.map((f,i) => (
                    <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}} layout
                      className="flex items-center justify-between bg-zinc-800/50 px-4 py-3.5 rounded-2xl">
                      <div>
                        <p className="text-base font-bold text-white">{f.name} <span className="text-zinc-500 font-normal text-sm">({f.qty}q)</span></p>
                        <p className="text-xs text-zinc-500 mt-0.5">Z:{f.protein}g · K:{f.carbs}g · Y:{f.fat}g</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-black text-base">{f.kcal} kcal</span>
                        <motion.button whileTap={{scale:0.85}} onClick={() => removeFood(i)}
                          className="text-zinc-600 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 rounded-md transition-colors p-1">
                          <X size={15} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══════════════════ TAB: SU ═══════════════════ */}
        {activeTab==="water" && (
          <motion.div key="water" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/6 text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Günlük Su</p>
                <motion.p key={waterCups} initial={{scale:0.8}} animate={{scale:1}} transition={{type:"spring",stiffness:400}}
                  className="text-7xl font-black text-blue-400 tracking-tight">{waterCups}</motion.p>
                <p className="text-zinc-500 text-base mt-1">/ {WATER_GOAL} stəkan</p>
              </div>

              {/* Stəkan vizual */}
              <div className="flex justify-center gap-1.5 flex-wrap px-2">
                {[...Array(WATER_GOAL)].map((_,i) => (
                  <motion.div key={i} animate={{ scale: i<waterCups ? [1,1.15,1] : 1 }}
                    className={`w-6 h-10 rounded-b-xl rounded-t-md border-2 transition-all duration-300 ${
                      i<waterCups ? "bg-blue-500 border-blue-400" : "border-zinc-700"
                    }`} />
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <motion.button whileTap={{scale:0.9}} onClick={() => setWaterCups(c=>Math.max(0,c-1))}
                  className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 transition-all">
                  <Minus size={20} />
                </motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={addWater}
                  className="flex-1 max-w-xs bg-blue-500 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 transition-all flex items-center justify-center gap-2">
                  <Droplets size={18} /> Stəkan əlavə et
                </motion.button>
              </div>

              <AnimatePresence>
                {waterCups>=WATER_GOAL && (
                  <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0,opacity:0}} transition={{type:"spring"}}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl py-3 px-4">
                    <p className="text-emerald-400 font-black text-lg">🎉 Hədəf tamamlandı!</p>
                    <p className="text-zinc-500 text-sm">Əla işdir! Davam et.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ TAB: YUXU ═══════════════════ */}
        {activeTab==="sleep" && (
          <motion.div key="sleep" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            {sleepLogs[0] && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Son yuxu" value={sleepLogs[0].hours} unit="saat" icon={Moon}
                  color={sleepLogs[0].hours>=7?"text-emerald-400":"text-yellow-400"} iconColor="text-purple-500" />
                <StatCard label="Keyfiyyət" value={"⭐".repeat(sleepLogs[0].quality)} unit="" icon={Star} iconColor="text-yellow-600" valueClassName="text-xl" />
              </div>
            )}
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-4">
              <SectionTitle icon={Moon} label="Yuxu Qeyd Et" color="text-purple-400" />
              {!sleepInput ? (
                <motion.button whileTap={{scale:0.97}} onClick={() => setSleepInput(true)}
                  className="w-full border border-dashed border-zinc-700 text-zinc-400 py-5 rounded-2xl font-bold text-base hover:border-zinc-500 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> Bu gecəki yuxunu əlavə et
                </motion.button>
              ) : (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-3">
                  <div>
                    <p className="text-sm text-zinc-400 mb-2 font-medium">Neçə saat yatdın?</p>
                    <InputField type="number" placeholder="7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2 font-medium">Keyfiyyəti necə idi?</p>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map((q) => (
                        <motion.button key={q} whileTap={{scale:0.9}} onClick={() => setSleepQuality(q)}
                          className={`flex-1 min-w-0 py-2.5 rounded-lg text-xs font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 transition-all ${
                            sleepQuality===q ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}>{q}⭐</motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSleepInput(false)} className="flex-1 bg-zinc-800 text-zinc-400 py-3.5 rounded-2xl font-bold text-base hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50 transition-all">Ləğv et</button>
                    <motion.button whileTap={{scale:0.97}} onClick={logSleep}
                      className="flex-1 bg-purple-500 text-white py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 transition-all">
                      <Check size={18} /> Qeyd et
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
            {sleepLogs.length>0 && (
              <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-2.5">
                <SectionTitle icon={Activity} label="Son yuxular" />
                {sleepLogs.map((s,i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/50 px-4 py-3.5 rounded-2xl">
                    <div>
                      <p className="text-base font-bold text-white">{s.hours} saat</p>
                      <p className="text-xs text-zinc-500">{s.date}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{"⭐".repeat(s.quality)}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        s.hours>=7 ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"
                      }`}>{s.hours>=7?"Yaxşı":"Az"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ TAB: BƏDƏN ÖLÇÜLƏRİ ═══════════════════ */}
        {activeTab==="body" && (
          <motion.div key="body" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            {weightLogs.length>0 && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Son çəki" value={weightLogs[0].weight} unit="kg" color="text-emerald-400" icon={Scale} iconColor="text-emerald-600" />
                {weightLogs[0].waist && <StatCard label="Bel" value={weightLogs[0].waist} unit="sm" />}
              </div>
            )}
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-4">
              <SectionTitle icon={Scale} label="Bədən Ölçüsü Qeyd Et" color="text-emerald-400" />
              {!showBodyForm ? (
                <motion.button whileTap={{scale:0.97}} onClick={() => setShowBodyForm(true)}
                  className="w-full border border-dashed border-zinc-700 text-zinc-400 py-5 rounded-2xl font-bold text-base hover:border-zinc-500 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> Bugünkü ölçüləri əlavə et
                </motion.button>
              ) : (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-3">
                  <InputField type="number" placeholder="Çəki (kg) — məcburidir" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                  <InputField type="number" placeholder="Bel ölçüsü (sm) — istəyə bağlı" value={waistInput} onChange={(e) => setWaistInput(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => setShowBodyForm(false)} className="flex-1 bg-zinc-800 text-zinc-400 py-3.5 rounded-2xl font-bold text-base hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50 transition-all">Ləğv et</button>
                    <motion.button whileTap={{scale:0.97}} onClick={logBody}
                      className="flex-1 bg-emerald-500 text-black py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all">
                      <Check size={18} /> Qeyd et
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
            {weightLogs.length>=2 && (
              <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6">
                <SectionTitle icon={TrendingUp} label="Çəki dinamikası" color="text-emerald-400" />
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={[...weightLogs].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{fill:"#52525b",fontSize:11}} tickLine={false} />
                    <YAxis domain={["auto","auto"]} tick={{fill:"#52525b",fontSize:11}} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{background:"#18181b",border:"1px solid #27272a",borderRadius:12,color:"#fff",fontSize:13}} />
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} dot={{fill:"#10b981",r:4,strokeWidth:0}} activeDot={{r:6,fill:"#10b981"}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {weightLogs.length>0 && (
              <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-2.5">
                <SectionTitle icon={Activity} label="Qeydlər" />
                {weightLogs.map((w,i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/50 px-4 py-3.5 rounded-2xl">
                    <p className="text-sm text-zinc-400 font-medium">{w.date}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-base">{w.weight} kg</span>
                      {w.waist && <span className="text-zinc-500 text-sm">Bel: {w.waist} sm</span>}
                      {i>0 && (
                        <span className={`text-sm font-black ${w.weight<weightLogs[i-1].weight?"text-emerald-400":"text-red-400"}`}>
                          {w.weight<weightLogs[i-1].weight?"▼":"▲"}{Math.abs(w.weight-weightLogs[i-1].weight).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ TAB: ANALİZ ═══════════════════ */}
        {activeTab==="progress" && (
          <motion.div key="progress" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Bu gün xal" value={totalPts} unit="xal" color="text-emerald-400" icon={Trophy} iconColor="text-yellow-600" />
              <StatCard label="Məşq seriyası" value={streak} unit="gün" color="text-orange-400" icon={Flame} iconColor="text-orange-600" />
            </div>
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6">
              <SectionTitle icon={BarChart2} label="Həftəlik aktivlik" color="text-blue-400" />
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weekData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="day" tick={{fill:"#52525b",fontSize:12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill:"#52525b",fontSize:12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:"#18181b",border:"1px solid #27272a",borderRadius:12,color:"#fff",fontSize:13}} />
                  <Bar dataKey="pts" fill="#10b981" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6 space-y-3.5">
              <SectionTitle icon={Activity} label="Bu günkü aktivlik" />
              {[
                {label:"Qaçış",      val:`${stats.run} km`,       icon:"🏃", pts:stats.run,          color:"text-emerald-400"},
                {label:"Yürüş",      val:`${stats.walk} km`,      icon:"🚶", pts:stats.walk*0.5,     color:"text-blue-400"},
                {label:"Məşq",       val:`${stats.workout} saat`, icon:"💪", pts:stats.workout*5,    color:"text-purple-400"},
                {label:"Velosiped",  val:`${stats.bike} km`,      icon:"🚴", pts:stats.bike*0.4,     color:"text-yellow-400"},
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-base font-bold text-white">{item.label}</p>
                      <p className="text-sm text-zinc-500">{item.val}</p>
                    </div>
                  </div>
                  <span className={`font-black text-base ${item.color}`}>+{Math.round(item.pts)} xal</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-3.5 flex items-center justify-between">
                <span className="text-zinc-400 text-base font-bold">Cəmi</span>
                <span className="text-white text-xl font-black">{totalPts} xal</span>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6">
              <SectionTitle icon={Apple} label="Bugünkü qida icmalı" color="text-green-400" />
              <div className="space-y-3.5">
                {[
                  {label:"Kalori",      val:calories,       max:CALORIE_GOAL, color:calOver?"bg-red-500":"bg-emerald-500"},
                  {label:"Zülal",       val:macros.protein, max:150,          color:"bg-blue-400"},
                  {label:"Karbohidrat", val:macros.carbs,   max:250,          color:"bg-yellow-400"},
                  {label:"Yağ",         val:macros.fat,     max:70,           color:"bg-orange-400"},
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-zinc-400 font-medium">{m.label}</span>
                      <span className="text-sm text-white font-bold">{m.val} / {m.max}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${Math.min((m.val/m.max)*100,100)}%`}} transition={{duration:0.7,ease:"easeOut"}}
                        className={`h-full rounded-full ${m.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ TAB: MEDALLƏR ═══════════════════ */}
        {activeTab==="badges" && (
          <motion.div key="badges" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className="space-y-4">
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/6">
              <SectionTitle icon={Award} label="Nailiyyətlər" color="text-yellow-400" />
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${(unlockedAch.length/ACHIEVEMENTS.length)*100}%`}}
                    transition={{duration:0.8,ease:"easeOut"}} className="h-full bg-yellow-400 rounded-full" />
                </div>
                <span className="text-zinc-400 text-sm font-bold">{unlockedAch.length}/{ACHIEVEMENTS.length}</span>
              </div>
              <div className="space-y-2.5">
                {ACHIEVEMENTS.map((ach, idx) => {
                  const unlocked = unlockedAch.includes(ach.id);
                  return (
                    <motion.div key={ach.id}
                      initial={{opacity:0,x:-15}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        unlocked ? "bg-yellow-500/8 border-yellow-500/25" : "bg-zinc-900/40 border-zinc-800/40 opacity-45"
                      }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${unlocked?"bg-yellow-500/10":"bg-zinc-800"}`}>
                        <span className={!unlocked?"grayscale":""} style={{filter:!unlocked?"grayscale(1)":""}}>{ach.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-base ${unlocked?"text-yellow-400":"text-zinc-500"}`}>{ach.title}</p>
                        <p className="text-sm text-zinc-600">{ach.desc}</p>
                      </div>
                      {unlocked && (
                        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}}>
                          <div className="w-7 h-7 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-yellow-400" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
