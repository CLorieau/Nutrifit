// components/calendar.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/* ===== Réglages ===== */
const LOCALE = 'fr-FR';
const STARTS_ON_SUNDAY = false;      // semaine commence le lundi
const HIGHLIGHT = '#C9F34A';         // vert de sélection
const WEEKS_BEFORE = 26;
const WEEKS_AFTER  = 26;
const PICKER_HEIGHT = 96;            // hauteur stricte du picker (pas d’espace)
/* ==================== */

// Helpers dates
function startOfWeek(date, startsOnSunday = true) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Dim..6=Sam
    const diff = startsOnSunday ? day : (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}
function monthLabel(date) {
    return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

// Données fictives (remplace par l’API plus tard)
function fakeEventsFor(date) {
    const d = date.getDate();
    if (d % 3 === 0) return [];
    const base = [
        { type: 'workout', title: 'Séance musculation 1', start: '09:00', end: '10:15', duration: '1 h 15 min' },
        { type: 'meal',    title: 'Déjeuner',             start: '12:00', end: '13:00', duration: '1 h' },
        { type: 'workout', title: 'Séance musculation 2', start: '15:00', end: '16:15', duration: '1 h 15 min' },
        { type: 'meal',    title: 'Dîner',                start: '20:00', end: '21:00', duration: '1 h' },
    ];
    if (d % 2 === 0) base.splice(2, 1);
    return base;
}

export default function Calendar({ initialDate = new Date(), onDateChange }) {
    const insets = useSafeAreaInsets();

    // Sélection par défaut = aujourd’hui
    const [selected, setSelected] = useState(() => {
        const d = new Date(initialDate); d.setHours(0,0,0,0); return d;
    });

    // Génère les semaines autour d’aujourd’hui
    const weeks = useMemo(() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const center = startOfWeek(today, STARTS_ON_SUNDAY);
        const data = [];
        for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
            const ws = addDays(center, i * 7);
            const days = Array.from({ length: 7 }, (_, k) => { const d = addDays(ws, k); d.setHours(0,0,0,0); return d; });
            data.push({ key: ws.toISOString(), weekStart: ws, days });
        }
        return data;
    }, []);

    // Trouve l’index de la semaine de la date sélectionnée
    const initialWeekIndex = useMemo(() => {
        const key = startOfWeek(selected, STARTS_ON_SUNDAY).toISOString();
        const idx = weeks.findIndex(w => w.key === key);
        return idx < 0 ? 0 : idx;
    }, [selected, weeks]);

    // FlatList horizontale (picker)
    const listRef = useRef(null);
    const { width } = useWindowDimensions();
    const [pageWidth, setPageWidth] = useState(width);
    useEffect(() => { setPageWidth(width); }, [width]);
    useEffect(() => {
        if (listRef.current && initialWeekIndex >= 0) {
            try { listRef.current.scrollToIndex({ index: initialWeekIndex, animated: false }); } catch {}
        }
    }, [initialWeekIndex, pageWidth]);

    const renderWeek = ({ item }) => {
        const displayedMonth = selected.getMonth();
        return (
            <View style={{ width: pageWidth, paddingHorizontal: 16 }}>
                {/* Une seule ligne (lettre + jour) — sans padding vertical superflu */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                    {item.days.map((d, i) => {
                        const isSelected = sameDay(d, selected);
                        const isOtherMonth = d.getMonth() !== displayedMonth;
                        const dayLetter = d.toLocaleDateString(LOCALE, { weekday: 'short' })
                            .replace('.', '').slice(0,1).toUpperCase();
                        return (
                            <Pressable
                                key={i}
                                onPress={() => { setSelected(d); onDateChange?.(d); }}
                                style={({ pressed }) => ({
                                    width: 48, height: 72, borderRadius: 16,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isSelected ? HIGHLIGHT : 'transparent',
                                    opacity: isOtherMonth ? 0.35 : 1,
                                    transform: [{ translateY: isSelected ? -2 : 0 }],
                                    ...(pressed && !isSelected ? { opacity: 0.6 } : null),
                                })}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: isSelected ? '#0A0A0A' : '#6B7280', marginBottom: 2 }}>
                                    {dayLetter}
                                </Text>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>{d.getDate()}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    };

    const today = new Date();
    const headerTitle = sameDay(selected, today) ? "Aujourd'hui" : selected.toLocaleDateString(LOCALE, { weekday: 'long' });
    const events = useMemo(() => fakeEventsFor(selected), [selected]);

    function ActivityIcon({ type, size = 24 }) {
        if (type === 'workout') return <MaterialCommunityIcons name="dumbbell" size={size} />;
        if (type === 'meal')    return <MaterialCommunityIcons name="silverware-fork-knife" size={size} />;
        return <Ionicons name="ellipse-outline" size={size} />;
    }

    function ActivityCard({ e }) {
        const isMeal = e.type === 'meal';
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: isMeal ? '#EAFBD1' : '#F3F4F6',
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2,
                }}
            >
                <View style={{ width: 36, alignItems: 'center' }}>
                    <ActivityIcon type={e.type} size={26} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{e.title}</Text>
                    <Text style={{ marginTop: 2, fontSize: 12, color: '#6B7280' }}>
                        Durée : {e.duration}
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} />
            </View>
        );
    }

    function Row({ e }) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 88, paddingRight: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
                    <Text style={{ fontVariant: ['tabular-nums'], textAlign: 'right', color: '#111827', fontWeight: '600' }}>{e.start}</Text>
                    <Text style={{ textAlign: 'right', color: '#6B7280' }}>—</Text>
                    <Text style={{ fontVariant: ['tabular-nums'], textAlign: 'right', color: '#111827', fontWeight: '600' }}>{e.end}</Text>
                </View>
                <View style={{ width: 14 }} />
                <ActivityCard e={e} />
            </View>
        );
    }

    return (
        <View
            style={{ flex: 1, backgroundColor: '#F5F5F7', paddingTop: insets.top + 20 }}
            onLayout={() => setPageWidth(width)}
        >
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                <Text style={{ fontSize: 34, fontWeight: '700', color: '#0A0A0A', textTransform: 'capitalize' }}>
                    {headerTitle}
                </Text>
                <Text style={{ marginTop: -2, fontSize: 14, color: '#6B7280', textTransform: 'capitalize' }}>
                    {monthLabel(selected)}
                </Text>
            </View>

            {/* ====== PICKER : container à hauteur FIXE ====== */}
            <View style={{ height: PICKER_HEIGHT, justifyContent: 'center' }}>
                <FlatList
                    ref={listRef}
                    data={weeks}
                    initialScrollIndex={initialWeekIndex}
                    keyExtractor={(w) => w.key}
                    renderItem={renderWeek}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    // Pas de padding vertical → pas d’espace ajouté
                    contentContainerStyle={{}}
                    style={{}} // on laisse la hauteur au parent
                    getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
                    onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
                        const week = weeks[idx];
                        if (!week) return;
                        const dayIndex = STARTS_ON_SUNDAY
                            ? selected.getDay()
                            : (selected.getDay() === 0 ? 6 : selected.getDay() - 1);
                        const fallback = week.days[dayIndex] || week.days[0];
                        setSelected(prev => (week.days.some(d => sameDay(d, prev)) ? prev : fallback));
                    }}
                />
            </View>
            {/* ====== FIN PICKER ====== */}

            {/* Planning du jour — immédiatement sous le picker */}
            <View style={{ paddingHorizontal: 20, flex: 1, marginTop: 8 }}>
                {/* En-têtes */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ width: 88, paddingRight: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
                        <Text style={{ color: '#6B7280', fontSize: 13, textAlign: 'right' }}>Heure</Text>
                    </View>
                    <View style={{ width: 14 }} />
                    <Text style={{ color: '#6B7280', fontSize: 13 }}>Activité</Text>
                </View>

                {events.length === 0 ? (
                    <View style={{ paddingVertical: 30, alignItems: 'center', opacity: 0.7 }}>
                        <Ionicons name="calendar-outline" size={28} />
                        <Text style={{ marginTop: 8, color: '#6B7280' }}>Aucune activité pour ce jour</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                        {events.map((e, idx) => <Row key={idx} e={e} />)}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}
