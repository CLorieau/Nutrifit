// components/calendar.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getPlanningByDate } from "../api/calendrier";
import { getRecette } from "../api/recettes";
import { getExercice } from "../api/exercices";
import { useNavigation } from "@react-navigation/native";
import { useChat } from "../ChatContext";

/* ===== Config ===== */
const LOCALE         = "en-US";
const STARTS_ON_SUNDAY = false;
const ACCENT         = "#A3FF3D";
const DARK           = "#0A0A0A";
const BG             = "#F7F7F9";
const WEEKS_BEFORE   = 26;
const WEEKS_AFTER    = 26;
const PICKER_HEIGHT  = 88;
/* ================== */

// ─── Date helpers ────────────────────────────────────────────────────────────
function startOfWeek(date, startsOnSunday = true) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = startsOnSunday ? day : day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function monthLabel(date) {
  return date.toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
}
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === "??:??") return -1;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
}
function checkCollision(start, end, events) {
  return events.some((e) => {
    if (e.startMin === -1 || e.endMin === -1) return false;
    return start < e.endMin && end > e.startMin;
  });
}

// ─── DB → Events ─────────────────────────────────────────────────────────────
function mapDatabaseToEvents(dbData) {
  const events = [];

  const mealTimes = {
    petit_dejeuner: { start: "08:00", end: "08:30", duration: "30 min" },
    dejeuner:       { start: "12:30", end: "13:30", duration: "1 h" },
    collation:      { start: "16:00", end: "16:15", duration: "15 min" },
    diner:          { start: "20:00", end: "21:00", duration: "1 h" },
  };

  dbData.repas.forEach((r) => {
    let start = "??:??", end = "??:??", duration = "?";
    if (r.heure_debut) {
      start = r.heure_debut.slice(0, 5);
      duration = "1 h";
      end = formatTime(timeToMinutes(start) + 60);
    } else {
      const t = mealTimes[r.categorie];
      if (t) { start = t.start; end = t.end; duration = t.duration; }
    }
    events.push({
      type: "meal", title: r.recette?.nom_recette || r.categorie || "Free meal",
      start, end, duration,
      details: r.recette ? `${r.recette.calories} kcal` : "",
      startMin: timeToMinutes(start), endMin: timeToMinutes(end),
      recipeId: r.id_recette, category: r.categorie, recipe: r.recette,
    });
  });

  dbData.seances.forEach((s) => {
    const durationMin = s.duree || 60;
    const durationStr = `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? ` ${durationMin % 60}min` : ""}`;
    let placedStart = -1;
    if (!checkCollision(900, 900 + durationMin, events))       placedStart = 900;
    else if (!checkCollision(540, 540 + durationMin, events))  placedStart = 540;
    else {
      for (let t = 360; t <= 1320 - durationMin; t += 30) {
        if (!checkCollision(t, t + durationMin, events)) { placedStart = t; break; }
      }
    }
    if (placedStart !== -1) {
      const placedEnd = placedStart + durationMin;
      events.push({
        type: "workout", title: s.exercice?.nom_exercice || s.nom || "Workout",
        start: formatTime(placedStart), end: formatTime(placedEnd), duration: durationStr,
        details: "Fitness goal",
        startMin: placedStart, endMin: placedEnd,
        exerciseId: s.id_exercice, seanceId: s.id_seance, exercice: s.exercice,
      });
    }
  });

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Calendar({ initialDate = new Date(), onDateChange }) {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();
  const { openChat } = useChat();

  const [selected, setSelected] = useState(() => {
    const d = new Date(initialDate);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [checkedMeals, setCheckedMeals] = useState({});

  // ── Load checked state ──
  useEffect(() => {
    let isMounted = true;
    const loadChecks = async () => {
      if (!events.some((e) => e.type === "meal")) return;
      const offset  = selected.getTimezoneOffset() * 60000;
      const dateStr = new Date(selected - offset).toISOString().slice(0, 10);
      const states  = {};
      for (const e of events) {
        if (e.type === "meal") {
          const key = `meal_done_${dateStr}_${e.category}_${e.recipeId || "none"}`;
          states[key] = (await AsyncStorage.getItem(key)) === "true";
        }
      }
      if (isMounted) setCheckedMeals(states);
    };
    loadChecks();
    return () => { isMounted = false; };
  }, [events, selected]);

  const toggleMeal = async (e) => {
    const offset  = selected.getTimezoneOffset() * 60000;
    const dateStr = new Date(selected - offset).toISOString().slice(0, 10);
    const key     = `meal_done_${dateStr}_${e.category}_${e.recipeId || "none"}`;
    const next    = !checkedMeals[key];
    setCheckedMeals((prev) => ({ ...prev, [key]: next }));
    await AsyncStorage.setItem(key, next ? "true" : "false");
  };

  // ── Fetch events ──
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const offset      = selected.getTimezoneOffset() * 60000;
        const localISOTime = new Date(selected - offset).toISOString().slice(0, 10);
        const userId      = 180001;
        const basicData   = await getPlanningByDate(userId, localISOTime);

        const enrichedRepas = await Promise.all(
          (basicData.repas || []).map(async (r) => {
            if (r.id_recette) {
              try { return { ...r, recette: (await getRecette(r.id_recette)).data }; }
              catch { return r; }
            }
            return r;
          })
        );
        const enrichedSeances = await Promise.all(
          (basicData.seances || []).map(async (s) => {
            if (s.id_exercice) {
              try { return { ...s, exercice: (await getExercice(s.id_exercice)).data }; }
              catch { return s; }
            }
            return s;
          })
        );

        if (isMounted) {
          setEvents(mapDatabaseToEvents({ ...basicData, repas: enrichedRepas, seances: enrichedSeances }));
        }
      } catch (err) {
        console.error("Calendar fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEvents();
    return () => { isMounted = false; };
  }, [selected]);

  // ── Week picker ──
  const weeks = useMemo(() => {
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const center = startOfWeek(today, STARTS_ON_SUNDAY);
    const data   = [];
    for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
      const ws   = addDays(center, i * 7);
      const days = Array.from({ length: 7 }, (_, k) => {
        const d = addDays(ws, k); d.setHours(0, 0, 0, 0); return d;
      });
      data.push({ key: ws.toISOString(), weekStart: ws, days });
    }
    return data;
  }, []);

  const initialWeekIndex = useMemo(() => {
    const key = startOfWeek(selected, STARTS_ON_SUNDAY).toISOString();
    const idx = weeks.findIndex((w) => w.key === key);
    return idx < 0 ? 0 : idx;
  }, [selected, weeks]);

  const listRef = useRef(null);
  const { width } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(width);

  useEffect(() => { setPageWidth(width); }, [width]);
  useEffect(() => {
    if (listRef.current && initialWeekIndex >= 0) {
      try { listRef.current.scrollToIndex({ index: initialWeekIndex, animated: false }); } catch {}
    }
  }, [initialWeekIndex, pageWidth]);

  const today = new Date();

  // ── Week row renderer ──
  const renderWeek = ({ item }) => (
    <View style={{ width: pageWidth, paddingHorizontal: 20 }}>
      <View style={styles.weekRow}>
        {item.days.map((d, i) => {
          const isSelected = sameDay(d, selected);
          const isToday    = sameDay(d, today);
          const dayLetter  = d
            .toLocaleDateString(LOCALE, { weekday: "short" })
            .replace(".", "")
            .slice(0, 1)
            .toUpperCase();
          return (
            <Pressable
              key={i}
              onPress={() => { setSelected(d); onDateChange?.(d); }}
              style={({ pressed }) => [
                styles.dayBtn,
                isSelected && styles.dayBtnSelected,
                pressed && !isSelected && { opacity: 0.55 },
              ]}
            >
              <Text style={[styles.dayLetter, isSelected && styles.dayLetterSelected]}>
                {dayLetter}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {d.getDate()}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // ── Header title ──
  const headerTitle = sameDay(selected, today)
    ? "Today"
    : selected.toLocaleDateString(LOCALE, { weekday: "long" });

  // ── Activity card ──
  function ActivityCard({ e }) {
    const isMeal    = e.type === "meal";
    const isWorkout = e.type === "workout";

    const offset  = selected.getTimezoneOffset() * 60000;
    const dateStr = new Date(selected - offset).toISOString().slice(0, 10);
    const mealKey = `meal_done_${dateStr}_${e.category}_${e.recipeId || "none"}`;
    const isChecked = isMeal && !!checkedMeals[mealKey];

    const handlePress = () => {
      if (isMeal && e.recipeId) {
        navigation.navigate("RecipeDetail", { recipeId: e.recipeId });
      } else if (isWorkout) {
        if (e.seanceId)       navigation.navigate("Training", { seanceId: e.seanceId });
        else if (e.exerciseId) navigation.navigate("Training", { filterIds: [e.exerciseId] });
        else                   navigation.navigate("Training");
      }
    };

    const accentColor = isWorkout ? "#FF6432" : ACCENT;

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.82}
        style={[styles.card, isChecked && styles.cardChecked]}
      >
        {/* Left accent bar */}
        <View style={[styles.cardAccentBar, { backgroundColor: accentColor }]} />

        {/* Icon box */}
        <View style={[styles.cardIconBox, { backgroundColor: `${accentColor}1A` }]}>
          {isWorkout
            ? <MaterialCommunityIcons name="dumbbell" size={20} color={accentColor} />
            : <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={accentColor} />
          }
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, isChecked && styles.cardTitleChecked]} numberOfLines={1}>
            {e.title}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {e.duration}{e.details ? `  ·  ${e.details}` : ""}
          </Text>
        </View>

        {/* Meal checkbox */}
        {isMeal && (
          <TouchableOpacity
            onPress={() => toggleMeal(e)}
            activeOpacity={0.8}
            style={[styles.checkbox, isChecked && styles.checkboxChecked]}
          >
            {isChecked && <Ionicons name="checkmark" size={14} color="#000" />}
          </TouchableOpacity>
        )}

        {!isMeal && (
          <Ionicons name="chevron-forward" size={17} color="#444" style={{ marginLeft: 6 }} />
        )}
      </TouchableOpacity>
    );
  }

  // ── Timeline row ──
  function Row({ e }) {
    return (
      <View style={styles.rowContainer}>
        {/* Time column */}
        <View style={styles.timeCol}>
          <Text style={styles.timeStart}>{e.start}</Text>
          <View style={styles.timeLine} />
          <Text style={styles.timeEnd}>{e.end}</Text>
        </View>

        {/* Card */}
        <View style={{ flex: 1 }}>
          <ActivityCard e={e} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      onLayout={() => setPageWidth(width)}
    >
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ─── DATE TITLE ─── */}
      <View style={styles.dateTitleBlock}>
        <Text style={styles.dateTitle}>{headerTitle}</Text>
        <Text style={styles.dateSubtitle}>{monthLabel(selected)}</Text>
      </View>

      {/* ─── WEEK PICKER ─── */}
      <View style={styles.pickerWrapper}>
        <FlatList
          ref={listRef}
          data={weeks}
          initialScrollIndex={initialWeekIndex}
          keyExtractor={(w) => w.key}
          renderItem={renderWeek}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          onMomentumScrollEnd={(ev) => {
            const idx  = Math.round(ev.nativeEvent.contentOffset.x / pageWidth);
            const week = weeks[idx];
            if (!week) return;
            const dayIndex = STARTS_ON_SUNDAY
              ? selected.getDay()
              : selected.getDay() === 0 ? 6 : selected.getDay() - 1;
            const fallback = week.days[dayIndex] || week.days[0];
            setSelected((prev) =>
              week.days.some((d) => sameDay(d, prev)) ? prev : fallback
            );
          }}
        />
      </View>

      {/* ─── SEPARATOR ─── */}
      <View style={styles.separator} />

      {/* ─── TIMELINE HEADER ─── */}
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineHeaderLabel}>Time</Text>
        <Text style={[styles.timelineHeaderLabel, { marginLeft: 72 }]}>Activity</Text>
      </View>

      {/* ─── EVENTS ─── */}
      <View style={styles.eventsList}>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 50 }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-outline" size={30} color="#444" />
            </View>
            <Text style={styles.emptyText}>No activity planned</Text>
            <Text style={styles.emptySub}>Enjoy your free day!</Text>
          </View>
        ) : (
          events.map((e, idx) => <Row key={idx} e={e} />)
        )}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ─ Header ─
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  addButton: {
    backgroundColor: DARK,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─ Date title ─
  dateTitleBlock: {
    paddingHorizontal: 25,
    marginBottom: 14,
  },
  dateTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
    textTransform: "capitalize",
  },
  dateSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 1,
    textTransform: "capitalize",
  },

  // ─ Week picker ─
  pickerWrapper: {
    height: PICKER_HEIGHT,
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayBtn: {
    width: 44,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dayBtnSelected: {
    backgroundColor: DARK,
  },
  dayLetter: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayLetterSelected: {
    color: ACCENT,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
  },
  dayNumSelected: {
    color: "#fff",
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 2,
  },

  // ─ Separator ─
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 25,
    marginTop: 12,
    marginBottom: 16,
  },

  // ─ Timeline header ─
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 14,
  },
  timelineHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ─ Events ─
  eventsList: {
    paddingHorizontal: 25,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 14,
  },

  // Timeline column
  timeCol: {
    width: 46,
    alignItems: "flex-start",
    marginRight: 12,
    paddingTop: 14,
  },
  timeStart: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK,
    fontVariant: ["tabular-nums"],
  },
  timeLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 1,
    marginVertical: 4,
    minHeight: 12,
  },
  timeEnd: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    fontVariant: ["tabular-nums"],
  },

  // Activity card
  card: {
    flex: 1,
    backgroundColor: DARK,
    borderRadius: 18,
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  cardChecked: {
    opacity: 0.55,
  },
  cardAccentBar: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  cardTitleChecked: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  cardSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },

  // ─ Empty state ─
  emptyState: {
    marginTop: 50,
    alignItems: "center",
    gap: 10,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK,
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
