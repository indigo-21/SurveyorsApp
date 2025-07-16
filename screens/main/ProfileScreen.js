import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { AuthContext } from '../../store/auth-context';
import ScreenWrapper from '../../components/ScreenWrapper';
import Colors from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function ProfileScreen() {
    const authContext = useContext(AuthContext);
    const [url, setUrl] = useState('');
    
    const propertyInspector = authContext.propertyInspector;
    const user = propertyInspector.user;

    useEffect(() => {
        const getUrl = async () => {
            const scannedData = await AsyncStorage.getItem('scannedData');
            if (scannedData) {
                const parsedData = JSON.parse(scannedData);
                setUrl(parsedData.url);
            }
        };
        getUrl();
    }, []);

    const InfoCard = ({ title, value, icon }) => (
        <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
                {icon && <Text style={styles.infoIcon}>{icon}</Text>}
                <Text style={styles.infoTitle}>{title}</Text>
            </View>
            <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: `${url}storage/profile_images/${user.photo}`,
                            }}
                        />
                    </View>
                    <Text style={styles.profileName}>
                        {user.firstname} {user.lastname}
                    </Text>
                    <Text style={styles.profileRole}>
                        {user.account_level?.name}
                    </Text>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <InfoCard
                        title="Full Name"
                        value={`${user.firstname} ${user.lastname}`}
                        icon="👤"
                    />
                    
                    <InfoCard
                        title="Email Address"
                        value={user.email}
                        icon="📧"
                    />
                    
                    <InfoCard
                        title="Phone Number"
                        value={user.mobile}
                        icon="📱"
                    />
                </View>

                {/* Professional Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Information</Text>
                    
                    <InfoCard
                        title="Account Level"
                        value={user.account_level?.name}
                        icon="🏆"
                    />
                    
                    <InfoCard
                        title="Can Book Jobs"
                        value={user.property_inspector?.can_book_jobs ? 'Yes' : 'No'}
                        icon="📋"
                    />
                </View>

                {/* Account Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Status</Text>
                    
                    <InfoCard
                        title="Account Status"
                        value={user.property_inspector.is_active === 1 ? 'Active' : 'Inactive'}
                        icon={user.property_inspector.is_active === 1 ? '✅' : '❌'}
                    />
                    
                    <InfoCard
                        title="OTP Verified"
                        value={user.otp_verified_at ? 'Verified' : 'Not Verified'}
                        icon={user.otp_verified_at ? '✅' : '⏳'}
                    />
                    
                    {user.created_at && (
                        <InfoCard
                            title="Member Since"
                            value={new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            icon="📅"
                        />
                    )}
                </View>

                {/* Additional spacing at bottom */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: Colors.primary,
        borderRadius: 15,
        marginBottom: 20,
    },
    profileImageContainer: {
        marginBottom: 15,
    },
    profileImage: {
        width: windowWidth * 0.25,
        height: windowWidth * 0.25,
        borderRadius: (windowWidth * 0.25) / 2,
        borderWidth: 4,
        borderColor: Colors.white,
    },
    profileName: {
        fontSize: windowWidth > 500 ? 28 : 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 5,
    },
    profileRole: {
        fontSize: windowWidth > 500 ? 18 : 16,
        color: Colors.white,
        opacity: 0.9,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: windowWidth > 500 ? 22 : 18,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 15,
        paddingLeft: 5,
    },
    infoCard: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    infoTitle: {
        fontSize: windowWidth > 500 ? 16 : 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    infoValue: {
        fontSize: windowWidth > 500 ? 16 : 14,
        color: Colors.black,
        lineHeight: 20,
    },
});

export default ProfileScreen;
