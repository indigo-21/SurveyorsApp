import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Agenda } from "react-native-calendars";
import { format, eachDayOfInterval } from "date-fns";
import { fetchDataFromDB } from "../../util/database";
import { getScheduleJobs } from "../../util/db/jobs";
import { AuthContext } from "../../store/auth-context";
import Colors from "../../constants/Colors";
import ErrorBoundary from "../../components/ErrorBoundary";

function CalendarScreen() {
    const dateToday = format(new Date(), "yyyy-MM-dd");
    const authContext = useContext(AuthContext);

    // Add null checks to prevent crashes
    if (!authContext?.propertyInspector?.user?.property_inspector?.id) {
        return (
            <View style={styles.errorContainer}>
                <Text>Loading user data...</Text>
            </View>
        );
    }

    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;

    const [items, setItems] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize the propertyInspectorID to prevent unnecessary effect runs
    const memoizedPropertyInspectorID = useMemo(() => propertyInspectorID, [propertyInspectorID]);

    const fetchScheduledJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching jobs for propertyInspectorID:', memoizedPropertyInspectorID);
            
            const result = await fetchDataFromDB(getScheduleJobs(), [
                memoizedPropertyInspectorID,
            ]);
            
            console.log('Jobs fetched:', result?.length || 0);

            const newItems = {};

            const today = new Date();
            const dateRange = eachDayOfInterval({
                start: new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() - 7,
                ),
                end: new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() + 8,
                ),
            });

            dateRange.forEach((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                newItems[dateKey] = [];
            });

            // Fill in scheduled jobs with safe property access
            if (Array.isArray(result)) {
                result.forEach((job) => {
                    try {
                        if (!job || !job.schedule_date) {
                            console.warn('Invalid job data:', job);
                            return;
                        }

                        const scheduleDate = new Date(job.schedule_date);
                        if (isNaN(scheduleDate.getTime())) {
                            console.warn('Invalid date in job:', job.schedule_date);
                            return;
                        }

                        const dateKey = format(scheduleDate, "yyyy-MM-dd");
                        
                        if (!newItems[dateKey]) {
                            newItems[dateKey] = [];
                        }
                        
                        newItems[dateKey].push({
                            id: `${job.group_id}-${dateKey}-${newItems[dateKey].length}`, // Stable ID based on position
                            name: job.group_id || 'N/A',
                            customer_name: job.customer_name || 'Unknown Customer',
                            client_abbrevation: job.client_abbrevation || '',
                            address: (job.house_flat_prefix || '') + " " + (job.address1 || ''),
                            description: job.description || 'No Description',
                        });
                    } catch (jobError) {
                        console.error('Error processing individual job:', jobError);
                    }
                });
            }

            console.log('Calendar items prepared:', Object.keys(newItems).length, 'dates');
            setItems(newItems);
        } catch (error) {
            console.error("Error fetching scheduled jobs:", error);
            setError('Failed to load calendar data');
            
            // Fallback empty calendar
            const today = new Date();
            const dateRange = eachDayOfInterval({
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8),
            });
            
            const fallbackItems = {};
            dateRange.forEach((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                fallbackItems[dateKey] = [];
            });
            
            setItems(fallbackItems);
        } finally {
            setIsLoading(false);
        }
    }, [memoizedPropertyInspectorID]);

    useEffect(() => {
        fetchScheduledJobs();
    }, [fetchScheduledJobs]);

    const renderEmptyDate = useCallback(() => <View style={styles.hr} />, []);

    const renderItem = useCallback(
        (item) => {
            // Add safety checks for item properties
            if (!item) {
                return <View style={styles.emptyItem} />;
            }

            return (
                <View style={styles.item}>
                    <View
                        style={{
                            justifyContent: "space-between",
                            flexDirection: "row",
                        }}
                    >
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text style={{ fontSize: 14, marginBottom: 8 }}>
                                {item.name || 'N/A'}
                            </Text>
                            <Text style={{ fontSize: 18, marginBottom: 8 }}>
                                {item.customer_name || 'Unknown Customer'}
                            </Text>
                            <Text style={{ fontSize: 14 }}>
                                {item.address || 'No Address'}
                            </Text>
                            <Text
                                style={{
                                    backgroundColor: Colors.success,
                                    color: Colors.white,
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                    borderRadius: 20,
                                    alignSelf: "flex-start",
                                    overflow: "hidden",
                                    marginTop: 8,
                                }}
                            >
                                {item.description || 'No Description'}
                            </Text>
                        </View>
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>
                                {item.client_abbrevation || 'AES'}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        },
        [],
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading calendar...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.errorSubText}>Please try again later</Text>
            </View>
        );
    }

    return (
        <Agenda
            items={items}
            selected={dateToday}
            pastScrollRange={10}
            futureScrollRange={10}
            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            renderEmptyData={renderEmptyDate}
            rowHasChanged={(r1, r2) => {
                // Safer comparison to prevent infinite loops
                if (!r1 && !r2) return false;
                if (!r1 || !r2) return true;
                return r1.id !== r2.id;
            }}
            showOnlySelectedDayItems={false}
            theme={{
                agendaTodayColor: Colors.primary,
                agendaKnobColor: Colors.primary,
                todayBackgroundColor: Colors.primary,
                todayTextColor: "white",
                agendaDayTextColor: Colors.primary,
                agendaDayNumColor: Colors.primary,
                agendaTodayColor: Colors.primary,
                agendaKnobColor: Colors.primary,
                selectedDayBackgroundColor: Colors.primary,
                dotColor: Colors.primary,
            }}
        />
    );
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: "white",
        padding: 20,
        marginRight: 10,
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
    },
    emptyDate: {
        padding: 20,
        marginTop: 17,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
    },
    hr: {
        height: 1,
        backgroundColor: "#e1e1e1",
        marginVertical: 16,
    },
    clientRow: {
        fontSize: 16,
        alignContent: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        height: 60,
        width: 60,
        borderRadius: 30,
        marginLeft: 16,
    },
    clientName: {
        fontWeight: "bold",
        color: Colors.white,
        textAlign: "center",
        fontSize: 18,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#ff0000",
        marginBottom: 10,
        textAlign: "center",
    },
    errorSubText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    emptyItem: {
        height: 50,
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        marginVertical: 5,
    },
});

function CalendarScreenWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <CalendarScreen />
        </ErrorBoundary>
    );
}

export default CalendarScreenWithErrorBoundary;
