import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

import ScreenWrapper from "../components/ScreenWrapper";
import ScreenTitle from "../components/ScreenTitle";
import Colors from "../constants/Colors";
import JobDetailsBox from "../components/JobDetailsBox";
import { getJobDetails } from "../util/db/jobs";
import { fetchDataFromDB } from "../util/database";
import { getJobMeasures } from "../util/db/jobMeasures";

function JobDetailsScreen() {
    const [jobData, setJobData] = useState(
        {
            job: "",
            jobMeasure: [],
        }
    );
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const route = useRoute();
    const jobID = route.params?.jobID;
    const jobNumber = route.params?.jobNumber;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Job Details",
        });
    }, [navigation]);

    useEffect(() => {
        if (!jobID) return;
        // Optionally, check a global "dbReady" flag/context here
        if (isFocused) {
            const getJobDetailsQuery = getJobDetails();
            const getJobMeasuresQuery = getJobMeasures();

            const jobDetails = async () => {
                try {
                    const jobDetails = await fetchDataFromDB(getJobDetailsQuery, [jobID]);
                    const jobMeasuresDetails = await fetchDataFromDB(getJobMeasuresQuery, ["%" + jobNumber + "%"]);

                    setJobData({ job: jobDetails[0], jobMeasure: jobMeasuresDetails });
                } catch (error) {
                    console.error("Error fetching job details:", error);
                }
            };

            jobDetails();
        }
    }, [isFocused, jobID]);

    // console.log("Job Data:", jobData);

    return (
        <ScreenWrapper>
            <ScreenTitle title={`Job Details: ${jobNumber}`} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <JobDetailsBox title="Job Location">
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Owner Name</Text>
                        <Text style={styles.text}>{jobData.job.customer_name}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Email</Text>
                        <Text style={styles.text}>
                            {jobData.job.customer_email}
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Contact </Text>
                        <Text style={styles.text}>
                            {jobData.job.customer_primary_tel}
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>
                            Alternative Contact
                        </Text>
                        <Text style={styles.text}>
                            {jobData.job.customer_secondary_tel === ""
                                ? jobData.job.customer_secondary_tel
                                : "N/A"}
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>City</Text>
                        <Text style={styles.text}>{jobData.job.city}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Address</Text>
                        <Text style={styles.text}>{jobData.job.address1}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>County</Text>
                        <Text style={styles.text}>{jobData.job.county}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Postcode</Text>
                        <Text style={styles.text}>{jobData.job.postcode}</Text>
                    </View>
                </JobDetailsBox>

                <JobDetailsBox title="Job Details">
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Installer</Text>
                        <Text style={styles.text}>{jobData.job.firstname}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Cert Number</Text>
                        <Text style={styles.text}>{jobData.job.cert_no}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Installer TMLN</Text>
                        <Text style={styles.text}>{jobData.job.sub_installer_tmln}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Scheme</Text>
                        <Text style={styles.text}>{jobData.job.short_name}</Text>
                    </View>
                </JobDetailsBox>

                <JobDetailsBox title="Job Measures">
                    {jobData.jobMeasure.map((measure) => (
                        <View key={measure.id} >
                            <View style={styles.content}>
                                <Text style={styles.textColumn}>Job Number</Text>
                                <Text style={styles.text}>{measure.job_number}</Text>
                            </View>
                            <View style={styles.content}>
                                <Text style={styles.textColumn}>Measure</Text>
                                <Text style={styles.text}>{measure.measure_cat}</Text>
                            </View>
                            <View style={styles.content}>
                                <Text style={styles.textColumn}>UMR</Text>
                                <Text style={styles.text}>{measure.umr}</Text>
                            </View>
                            <View style={styles.content}>
                                <Text style={styles.textColumn}>
                                    Scheme Measure Info
                                </Text>
                                <Text style={styles.text}>
                                    {measure.info}
                                </Text>
                            </View>

                            <View style={styles.hr} />
                        </View>
                    ))
                    }


                </JobDetailsBox>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginTop: 16,
    },
    content: {
        flexDirection: "row",
        paddingVertical: 4,
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    text: {
        color: Colors.black,
        marginHorizontal: 8,
        fontSize: 16,
    },
    textColumn: {
        color: Colors.black,
        marginHorizontal: 8,
        fontWeight: "bold",
        flexBasis: 120,
        fontSize: 16,
    },
    hr: {
        height: 1,
        backgroundColor: "#e1e1e1",
        marginVertical: 16,
    },
});

export default JobDetailsScreen;
