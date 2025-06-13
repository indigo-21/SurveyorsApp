import { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Agenda } from "react-native-calendars";
import { format, eachDayOfInterval } from "date-fns";
import { fetchDataFromDB } from "../../util/database";
import { getScheduleJobs } from "../../util/db/jobs";
import { AuthContext } from "../../store/auth-context";
import Colors from "../../constants/Colors";

function CalendarScreen() {
    const dateToday = format(new Date(), "yyyy-MM-dd");
    const authContext = useContext(AuthContext);

    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;

    const [items, setItems] = useState();

    useEffect(() => {
        const fetchScheduledJobs = async () => {
            try {
                const result = await fetchDataFromDB(getScheduleJobs(), [
                    propertyInspectorID,
                ]);
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

                // Fill in scheduled jobs
                result.forEach((job) => {
                    const dateKey = format(
                        new Date(job.schedule_date),
                        "yyyy-MM-dd",
                    );
                    if (!newItems[dateKey]) {
                        newItems[dateKey] = [];
                    }
                    newItems[dateKey].push({
                        name: job.group_id,
                        customer_name: job.customer_name,
                        client_abbrevation: job.client_abbrevation,
                        address: job.house_flat_prefix + " " + job.address1,
                        description: job.description,
                    });
                });

                setItems(newItems);
            } catch (error) {
                console.error("Error fetching scheduled jobs:", error);
            }
        };

        fetchScheduledJobs();
    }, []);

    const renderEmptyDate = useCallback(() => <View style={styles.hr} />, []);

    const renderItem = useCallback(
        (item) => (
            <View style={styles.item}>
                <View
                    style={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                    }}
                >
                    <View style={{ flex: 1, flexDirection: "column" }}>
                        <Text style={{ fontSize: 14, marginBottom: 8 }}>
                            {item.name}
                        </Text>
                        <Text style={{ fontSize: 18, marginBottom: 8 }}>
                            {item.customer_name}
                        </Text>
                        <Text style={{ fontSize: 14 }}>{item.address}</Text>
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
                            {item.description}
                        </Text>
                    </View>
                    <View style={styles.clientRow}>
                        <Text style={styles.clientName}>AES</Text>
                    </View>
                </View>
            </View>
        ),
        [],
    );

    return (
        <Agenda
            items={items}
            selected={dateToday}
            pastScrollRange={10}
            futureScrollRange={10}
            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            renderEmptyData={renderEmptyDate}
            rowHasChanged={(r1, r2) => r1.name !== r2.name}
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
});

export default CalendarScreen;
