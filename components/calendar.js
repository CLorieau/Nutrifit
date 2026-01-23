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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// IMPORT DE L'API FICTIVE
import { getPlanningByDate } from "../api/calendrier";
import { useNavigation } from "@react-navigation/native";

/* ===== Réglages ===== */
const LOCALE = "fr-FR";
const STARTS_ON_SUNDAY = false;
const HIGHLIGHT = "#C9F34A";
const WEEKS_BEFORE = 26;
const WEEKS_AFTER = 26;
const PICKER_HEIGHT = 96;
/* ==================== */

// --- Helpers dates (Inchangés) ---
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

// --- FONCTION DE MAPPING (Transforme la BDD en Visuel Calendrier) ---
// --- Helpers time ---
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

// --- FONCTION DE MAPPING (Transforme la BDD en Visuel Calendrier) ---
function mapDatabaseToEvents(dbData) {
  const events = [];

  // 1. Traitement des Repas
  const mealTimes = {
    petit_dejeuner: { start: "08:00", end: "08:30", duration: "30 min" },
    dejeuner: { start: "12:30", end: "13:30", duration: "1 h" },
    collation: { start: "16:00", end: "16:15", duration: "15 min" },
    diner: { start: "20:00", end: "21:00", duration: "1 h" },
  };

  dbData.repas.forEach((r) => {
    let start = "??:??";
    let end = "??:??";
    let duration = "?";

    if (r.heure_debut) {
      start = r.heure_debut;
      if (start.length > 5) start = start.slice(0, 5);
      duration = "1 h";
      const startMin = timeToMinutes(start);
      // Calcul fin +1h
      const endMin = startMin + 60;
      end = formatTime(endMin);
    } else {
      const timeInfo = mealTimes[r.categorie];
      if (timeInfo) {
        start = timeInfo.start;
        end = timeInfo.end;
        duration = timeInfo.duration;
      }
    }

    events.push({
      type: "meal",
      title: r.recette ? r.recette.nom : "Repas libre",
      start: start,
      end: end,
      duration: duration,
      details: r.recette ? `${r.recette.calories} kcal` : "",
      startMin: timeToMinutes(start),
      endMin: timeToMinutes(end),
      recipeId: r.id_recette,
    });
  });

  // 2. Traitement des Séances (Placement Intelligent)
  // Priorités : 15h, puis 9h, puis libre.
  dbData.seances.forEach((s) => {
    const durationMin = s.duree || 60; // Par défaut 60 min
    const durationStr = `${Math.floor(durationMin / 60)}h ${durationMin % 60 > 0 ? (durationMin % 60) + "min" : ""}`;

    let placedStart = -1;

    // Tentative 1 : 15h00 (900 min)
    if (!checkCollision(900, 900 + durationMin, events)) {
      placedStart = 900;
    }
    // Tentative 2 : 09h00 (540 min)
    else if (!checkCollision(540, 540 + durationMin, events)) {
      placedStart = 540;
    }
    // Tentative 3 : Recherche créneau libre (de 6h à 22h, pas de 30min)
    else {
      for (let t = 360; t <= 1320 - durationMin; t += 30) {
        if (!checkCollision(t, t + durationMin, events)) {
          placedStart = t;
          break;
        }
      }
    }

    // Si on a trouvé une place
    if (placedStart !== -1) {
      const placedEnd = placedStart + durationMin;
      events.push({
        type: "workout",
        title: s.nom,
        start: formatTime(placedStart),
        end: formatTime(placedEnd),
        duration: durationStr,
        details: "Objectif forme",
        startMin: placedStart,
        endMin: placedEnd,
        exerciseId: s.id_exercice, // Old fallback
        seanceId: s.id_seance, // NEW: Session ID for full details
      });
    } else {
      // Pas de place trouvée -> on n'ajoute pas l'entraînement (ou on loggue)
      console.warn("Pas de créneau disponible pour l'entraînement :", s.nom);
    }
  });

  // Tri par heure de début
  return events.sort((a, b) => a.start.localeCompare(b.start));
}

export default function Calendar({
  initialDate = new Date("2026-01-20"),
  onDateChange,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // État local
  const [selected, setSelected] = useState(() => {
    const d = new Date(initialDate);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // On formate la date en YYYY-MM-DD pour l'API
        // Astuce : toISOString() passe en UTC, attention aux décalages horaires en réel.
        // Ici on construit la string manuellement pour rester en local.
        const offset = selected.getTimezoneOffset() * 60000;
        const localISOTime = new Date(selected - offset)
          .toISOString()
          .slice(0, 10);

        const userId = 180001; // ID Utilisateur en dur pour le test

        const basicData = await getPlanningByDate(userId, localISOTime);

        if (isMounted) {
          const formattedEvents = mapDatabaseToEvents(basicData);
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Erreur chargement planning:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [selected]); // Se re-déclenche quand la date change

  // Génère les semaines (Inchangé)
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const center = startOfWeek(today, STARTS_ON_SUNDAY);
    const data = [];
    for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
      const ws = addDays(center, i * 7);
      const days = Array.from({ length: 7 }, (_, k) => {
        const d = addDays(ws, k);
        d.setHours(0, 0, 0, 0);
        return d;
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

  useEffect(() => {
    setPageWidth(width);
  }, [width]);
  useEffect(() => {
    if (listRef.current && initialWeekIndex >= 0) {
      try {
        listRef.current.scrollToIndex({
          index: initialWeekIndex,
          animated: false,
        });
      } catch {}
    }
  }, [initialWeekIndex, pageWidth]);

  const renderWeek = ({ item }) => {
    const displayedMonth = selected.getMonth();
    return (
      <View style={{ width: pageWidth, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          {item.days.map((d, i) => {
            const isSelected = sameDay(d, selected);
            const isOtherMonth = d.getMonth() !== displayedMonth;
            const dayLetter = d
              .toLocaleDateString(LOCALE, { weekday: "short" })
              .replace(".", "")
              .slice(0, 1)
              .toUpperCase();
            return (
              <Pressable
                key={i}
                onPress={() => {
                  setSelected(d);
                  onDateChange?.(d);
                }}
                style={({ pressed }) => ({
                  width: 48,
                  height: 72,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? HIGHLIGHT : "transparent",
                  opacity: isOtherMonth ? 0.35 : 1,
                  transform: [{ translateY: isSelected ? -2 : 0 }],
                  ...(pressed && !isSelected ? { opacity: 0.6 } : null),
                })}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isSelected ? "#0A0A0A" : "#6B7280",
                    marginBottom: 2,
                  }}
                >
                  {dayLetter}
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#0A0A0A" }}
                >
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const today = new Date();
  const headerTitle = sameDay(selected, today)
    ? "Aujourd'hui"
    : selected.toLocaleDateString(LOCALE, { weekday: "long" });

  function ActivityIcon({ type, size = 24 }) {
    if (type === "workout")
      return <MaterialCommunityIcons name="dumbbell" size={size} />;
    if (type === "meal")
      return (
        <MaterialCommunityIcons name="silverware-fork-knife" size={size} />
      );
    return <Ionicons name="ellipse-outline" size={size} />;
  }

  function ActivityCard({ e }) {
    const isMeal = e.type === "meal";

    // Handler navigation
    const handlePress = () => {
      if (isMeal) {
        if (e.recipeId) {
          navigation.navigate("RecipeDetail", { recipeId: e.recipeId });
        }
      } else if (e.type === "workout") {
        if (e.seanceId) {
          navigation.navigate("Training", { seanceId: e.seanceId });
        } else if (e.exerciseId) {
          // Pass as filterIds array to support list filtering in Training screen
          navigation.navigate("Training", { filterIds: [e.exerciseId] });
        } else {
          // Fallback: navigate to training without filter (shows all)
          navigation.navigate("Training");
        }
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{
          flex: 1,
          backgroundColor: isMeal ? "#EAFBD1" : "#F3F4F6",
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        }}
      >
        <View style={{ width: 36, alignItems: "center" }}>
          <ActivityIcon type={e.type} size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{e.title}</Text>
          <Text style={{ marginTop: 2, fontSize: 12, color: "#6B7280" }}>
            Durée : {e.duration} {e.details ? `• ${e.details}` : ""}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} />
      </TouchableOpacity>
    );
  }

  function Row({ e }) {
    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <View
          style={{
            width: 88,
            paddingRight: 12,
            borderRightWidth: 1,
            borderRightColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontVariant: ["tabular-nums"],
              textAlign: "right",
              color: "#111827",
              fontWeight: "600",
            }}
          >
            {e.start}
          </Text>
          <Text style={{ textAlign: "right", color: "#6B7280" }}>—</Text>
          <Text
            style={{
              fontVariant: ["tabular-nums"],
              textAlign: "right",
              color: "#111827",
              fontWeight: "600",
            }}
          >
            {e.end}
          </Text>
        </View>
        <View style={{ width: 14 }} />
        <ActivityCard e={e} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F5F7",
        paddingTop: insets.top + 20,
      }}
      onLayout={() => setPageWidth(width)}
    >
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            color: "#0A0A0A",
            textTransform: "capitalize",
          }}
        >
          {headerTitle}
        </Text>
        <Text
          style={{
            marginTop: -2,
            fontSize: 14,
            color: "#6B7280",
            textTransform: "capitalize",
          }}
        >
          {monthLabel(selected)}
        </Text>
      </View>

      <View style={{ height: PICKER_HEIGHT, justifyContent: "center" }}>
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
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
            const week = weeks[idx];
            if (!week) return;
            const dayIndex = STARTS_ON_SUNDAY
              ? selected.getDay()
              : selected.getDay() === 0
                ? 6
                : selected.getDay() - 1;
            const fallback = week.days[dayIndex] || week.days[0];
            setSelected((prev) =>
              week.days.some((d) => sameDay(d, prev)) ? prev : fallback,
            );
          }}
        />
      </View>

      <View style={{ paddingHorizontal: 20, flex: 1, marginTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 88,
              paddingRight: 12,
              borderRightWidth: 1,
              borderRightColor: "#E5E7EB",
            }}
          >
            <Text
              style={{ color: "#6B7280", fontSize: 13, textAlign: "right" }}
            >
              Heure
            </Text>
          </View>
          <View style={{ width: 14 }} />
          <Text style={{ color: "#6B7280", fontSize: 13 }}>Activité</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={HIGHLIGHT}
            style={{ marginTop: 50 }}
          />
        ) : events.length === 0 ? (
          <View
            style={{ paddingVertical: 30, alignItems: "center", opacity: 0.7 }}
          >
            <Ionicons name="calendar-outline" size={28} />
            <Text style={{ marginTop: 8, color: "#6B7280" }}>
              Aucune activité pour ce jour
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            {events.map((e, idx) => (
              <Row key={idx} e={e} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
