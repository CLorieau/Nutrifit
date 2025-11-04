import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ------- Réglages -------
const LOCALE = 'fr-FR';              // ← tout passe en français
const STARTS_ON_SUNDAY = false;      // ← semaine commence le lundi (usage FR)
const HIGHLIGHT = '#C9F34A';         // vert sélection
const WEEKS_BEFORE = 26;
const WEEKS_AFTER = 26;
// ------------------------

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

export default function Calendar({ initialDate = new Date(), onDateChange }) {
    const insets = useSafeAreaInsets();

    // Sélection par défaut = aujourd’hui
    const [selected, setSelected] = useState(() => {
        const d = new Date(initialDate);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Génération des semaines autour d’aujourd’hui
    const weeks = useMemo(() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const center = startOfWeek(today, STARTS_ON_SUNDAY);
        const data = [];
        for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
            const ws = addDays(center, i * 7);
            const days = Array.from({ length: 7 }, (_, k) => {
                const d = addDays(ws, k); d.setHours(0,0,0,0); return d;
            });
            data.push({ key: ws.toISOString(), weekStart: ws, days });
        }
        return data;
    }, []);

    // Trouve la semaine de la date sélectionnée
    const initialWeekIndex = useMemo(() => {
        const key = startOfWeek(selected, STARTS_ON_SUNDAY).toISOString();
        const idx = weeks.findIndex(w => w.key === key);
        return idx < 0 ? 0 : idx;
    }, [selected, weeks]);

    // Gestion du scroll horizontal
    const listRef = useRef(null);
    const { width } = useWindowDimensions();
    const [pageWidth, setPageWidth] = useState(width);

    useEffect(() => { setPageWidth(width); }, [width]);
    useEffect(() => {
        if (listRef.current && initialWeekIndex >= 0) {
            try {
                listRef.current.scrollToIndex({ index: initialWeekIndex, animated: false });
            } catch {}
        }
    }, [initialWeekIndex, pageWidth]);

    const handleSelect = (d) => {
        setSelected(d);
        onDateChange?.(d);
    };

    const renderWeek = ({ item }) => {
        const displayedMonth = selected.getMonth();

        return (
            <View style={{ width: pageWidth, paddingHorizontal: 16 }}>
                {/* Jours */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
                    {item.days.map((d, i) => {
                        const isSelected = sameDay(d, selected);
                        const isOtherMonth = d.getMonth() !== displayedMonth;
                        const dayLetter = d
                            .toLocaleDateString(LOCALE, { weekday: 'short' })
                            .replace('.', '')     // supprime le point après "lun."
                            .slice(0, 1)
                            .toUpperCase();

                        return (
                            <Pressable
                                key={i}
                                onPress={() => handleSelect(d)}
                                style={({ pressed }) => ({
                                    width: 48,
                                    height: 72,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
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

    // Détermine le libellé du header ("Aujourd'hui" ou jour complet)
    const today = new Date();
    const headerTitle = sameDay(selected, today)
        ? "Aujourd'hui"
        : selected.toLocaleDateString(LOCALE, { weekday: 'long' });

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#F5F5F7',
                paddingTop: insets.top + 20, // espace pour éviter le notch
            }}
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

            {/* Carrousel de semaines */}
            <FlatList
                ref={listRef}
                data={weeks}
                initialScrollIndex={initialWeekIndex}
                keyExtractor={(w) => w.key}
                renderItem={renderWeek}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 14 }}
                getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
                    const week = weeks[idx];
                    if (!week) return;
                    const dayIndex = STARTS_ON_SUNDAY
                        ? selected.getDay()
                        : (selected.getDay() === 0 ? 6 : selected.getDay() - 1);
                    const fallback = week.days[dayIndex] || week.days[0];
                    setSelected(prev => {
                        const exists = week.days.some(d => sameDay(d, prev));
                        return exists ? prev : fallback;
                    });
                }}
            />
        </View>
    );
}
