import { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList,
    Dimensions 
} from "react-native";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { fetchDataFromDB } from "../../util/database";
import { getScheduleJobs } from "../../util/db/jobs";
import { AuthContext } from "../../store/auth-context";
import Colors from "../../constants/Colors";
import ErrorBoundary from "../../components/ErrorBoundary";

const windowWidth = Dimensions.get('window').width;

function CalendarScreen() {
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

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [jobs, setJobs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize the property inspector ID to prevent unnecessary re-renders
    const stablePropertyInspectorID = useMemo(() => propertyInspectorID, [propertyInspectorID]);

    // Fetch jobs data
    useEffect(() => {
        let isMounted = true;
        
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const result = await fetchDataFromDB(getScheduleJobs(), [stablePropertyInspectorID]);
                
                if (!isMounted) return;
                
                const jobsByDate = {};
                
                if (Array.isArray(result)) {
                    result.forEach((job) => {
                        if (job?.schedule_date) {
                            const scheduleDate = new Date(job.schedule_date);
                            if (!isNaN(scheduleDate.getTime())) {
                                const dateKey = format(scheduleDate, "yyyy-MM-dd");
                                
                                if (!jobsByDate[dateKey]) {
                                    jobsByDate[dateKey] = [];
                                }
                                
                                jobsByDate[dateKey].push({
                                    id: `${job.group_id || 'unknown'}-${dateKey}`,
                                    name: job.group_id || 'N/A',
                                    customer_name: job.customer_name || 'Unknown Customer',
                                    client_abbrevation: job.client_abbrevation || 'AES',
                                    address: `${job.house_flat_prefix || ''} ${job.address1 || ''}`.trim(),
                                    description: job.description || 'No Description',
                                });
                            }
                        }
                    });
                }
                
                setJobs(jobsByDate);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                if (isMounted) {
                    setError('Failed to load calendar data');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchJobs();
        
        return () => {
            isMounted = false;
        };
    }, [stablePropertyInspectorID]);

    // Generate calendar days organized by weeks
    const calendarWeeks = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        
        // Get the start and end of the calendar view (including previous/next month days)
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday = 0
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        
        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
        
        // Organize days into weeks (arrays of 7 days each)
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        
        console.log('Calendar weeks generated:', weeks.length);
        console.log('Days per week:', weeks.map(week => week.length));
        
        return weeks;
    }, [currentDate]);

    // Get jobs for selected date
    const selectedDateJobs = useMemo(() => {
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        return jobs[dateKey] || [];
    }, [jobs, selectedDate]);

    // Navigation handlers
    const goToPreviousMonth = useCallback(() => {
        setCurrentDate(prev => subMonths(prev, 1));
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentDate(prev => addMonths(prev, 1));
    }, []);

    // Date selection handler
    const handleDatePress = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    // Render individual job item
    const renderJobItem = useCallback(({ item }) => (
        <View style={styles.jobItem}>
            <View style={styles.jobContent}>
                <View style={styles.jobInfo}>
                    <Text style={styles.jobName}>{item.name}</Text>
                    <Text style={styles.customerName}>{item.customer_name}</Text>
                    <Text style={styles.jobAddress}>{item.address}</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.jobDescription}>{item.description}</Text>
                    </View>
                </View>
                <View style={styles.clientBadge}>
                    <Text style={styles.clientText}>{item.client_abbrevation}</Text>
                </View>
            </View>
        </View>
    ), []);

    // Render calendar day
    const renderCalendarDay = useCallback((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const hasJobs = jobs[dateKey] && jobs[dateKey].length > 0;
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        
        // Check if day is in current month
        const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM');

        return (
            <TouchableOpacity
                key={dateKey}
                style={[
                    styles.calendarDay,
                    isSelected && styles.selectedDay,
                    isToday && styles.todayDay,
                    !isCurrentMonth && styles.otherMonthDay
                ]}
                onPress={() => handleDatePress(day)}
            >
                <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                    !isCurrentMonth && styles.otherMonthText
                ]}>
                    {format(day, 'd')}
                </Text>
                {hasJobs && isCurrentMonth && <View style={styles.jobIndicator} />}
            </TouchableOpacity>
        );
    }, [jobs, selectedDate, handleDatePress, currentDate]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading calendar...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.errorSubText}>Please try again later</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
                    <Text style={styles.monthButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {format(currentDate, 'MMMM yyyy')}
                </Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
                    <Text style={styles.monthButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={styles.weekDaysContainer}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <View key={day} style={styles.weekDayHeader}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarContainer}>
                {calendarWeeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((day) => renderCalendarDay(day))}
                    </View>
                ))}
            </View>

            {/* Selected Date Jobs */}
            <View style={styles.jobsContainer}>
                <Text style={styles.jobsTitle}>
                    Jobs for {format(selectedDate, 'MMM dd, yyyy')}
                </Text>
                
                {selectedDateJobs.length > 0 ? (
                    <FlatList
                        data={selectedDateJobs}
                        renderItem={renderJobItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        style={styles.jobsList}
                    />
                ) : (
                    <View style={styles.noJobsContainer}>
                        <Text style={styles.noJobsText}>No jobs scheduled for this date</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.primary,
    },
    monthButton: {
        padding: 10,
    },
    monthButtonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    monthTitle: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 10,
    },
    weekDayHeader: {
        flex: 1,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    calendarContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingBottom: 10,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingBottom: 10,
    },
    calendarDay: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    selectedDay: {
        backgroundColor: Colors.primary,
        borderRadius: 25,
    },
    todayDay: {
        backgroundColor: Colors.secondary,
        borderRadius: 25,
    },
    otherMonthDay: {
        opacity: 0.3,
    },
    dayText: {
        fontSize: 16,
        color: Colors.black,
    },
    selectedDayText: {
        color: 'white',
        fontWeight: 'bold',
    },
    todayText: {
        color: 'white',
        fontWeight: 'bold',
    },
    otherMonthText: {
        color: Colors.gray,
    },
    jobIndicator: {
        position: 'absolute',
        bottom: 5,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.success,
    },
    jobsContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 10,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    jobsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 15,
    },
    jobsList: {
        flex: 1,
    },
    jobItem: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    jobContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    jobInfo: {
        flex: 1,
    },
    jobName: {
        fontSize: 14,
        color: Colors.gray,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 4,
    },
    jobAddress: {
        fontSize: 14,
        color: Colors.gray,
        marginBottom: 8,
    },
    descriptionContainer: {
        backgroundColor: Colors.success,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    jobDescription: {
        fontSize: 12,
        color: 'white',
    },
    clientBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
    clientText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    noJobsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    noJobsText: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
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