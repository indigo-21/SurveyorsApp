import { format } from "date-fns";
import { bookPIJob } from "../../../util/db/bookings";
import {
    closeJob,
    getClientMaxNoShow,
    getJobDetailsByJobNumber,
    updateBookedJob,
    updateBookingJob,
    updateJobForCustomerNoShow
} from "../../../util/db/jobs";
import { fetchFirstDataFromDB, insertOrUpdateData } from "../../../util/database";

const bookingQuery = bookPIJob();
const dateToday = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

const BookingService = async (value, status, jobNumber, propertyInspector, selectedDate) => {
    const propertyInspectorID = propertyInspector.user.property_inspector.id;
    const userID = propertyInspector.user.id;

    const { label, id } = status.find((item) => item.value === value);

    switch (value) {
        case "1":
            customerNoShow(jobNumber, id, label, userID, propertyInspectorID);
            break;
        case "2":
            customerCancelled(jobNumber, id, label, userID, propertyInspectorID);
            break;
        case "3":
            customerRequiresRebook(jobNumber, id, label, userID, propertyInspectorID);
            break;
        case "4":
            rebook(jobNumber, id, label, userID, propertyInspectorID, selectedDate);
            break;
    }

};

const customerNoShow = async (jobNumber, id, label, userID, propertyInspectorID) => {

    const clientMaxNoShowQuery = getClientMaxNoShow();
    const clientMaxNoShowParams = ["%" + jobNumber + "%"];
    const jobDetailsQuery = getJobDetailsByJobNumber();
    const jobDetailsParams = ["%" + jobNumber + "%"];

    try {
        const clientResult = await fetchFirstDataFromDB(clientMaxNoShowQuery, clientMaxNoShowParams);
        const jobResult = await fetchFirstDataFromDB(jobDetailsQuery, jobDetailsParams);

        if (jobResult.max_noshow + 1 >= clientResult.maximum_no_show) {
            // If the client has reached the maximum no-show limit, close the job
            const jobQuery = closeJob();
            const jobParams = [
                id,
                dateToday,
                dateToday,
                "%" + jobNumber + "%",
            ];
            await insertOrUpdateData(jobQuery, jobParams);

        } else {
            const jobQuery = updateJobForCustomerNoShow();

            const jobParams = [
                id,
                dateToday,
                "%" + jobNumber + "%",
            ];
            await insertOrUpdateData(jobQuery, jobParams);

        }

        const bookParams = [
            jobNumber,
            label,
            userID,
            propertyInspectorID,
            dateToday,
            "Property Inspector updated the status to " + label,
            dateToday,
            dateToday,
        ];

        await insertOrUpdateData(bookingQuery, bookParams);


    } catch (error) {
        console.error("Error fetching client max no show:", error);

    }

};

const customerCancelled = async (jobNumber, id, label, userID, propertyInspectorID) => {

    const closeJobQuery = closeJob();

    const closeJobParams = [
        id, // status id for customer cancelled
        dateToday,
        dateToday,
        "%" + jobNumber + "%", // job number pattern
    ];

    const bookParams = [
        jobNumber,
        label,
        userID,
        propertyInspectorID,
        dateToday,
        "Property Inspector updated the status to " + label,
        dateToday,
        dateToday,
    ];

    try {
        await insertOrUpdateData(closeJobQuery, closeJobParams);
        await insertOrUpdateData(bookingQuery, bookParams);

    } catch (error) {
        console.error("Error booking job:", error);

    }

};

const customerRequiresRebook = async (jobNumber, id, label, userID, propertyInspectorID) => {
    const jobQuery = updateBookedJob();
    const jobParams = [
        id, // status id for customer requires rebook
        dateToday,
        "%" + jobNumber + "%", // job number pattern
    ];

    const bookParams = [
        jobNumber,
        label,
        userID,
        propertyInspectorID,
        dateToday,
        "Property Inspector updated the status to " + label,
        dateToday,
        dateToday,
    ];

    try {
        await insertOrUpdateData(jobQuery, jobParams);
        await insertOrUpdateData(bookingQuery, bookParams);

    } catch (error) {
        console.error("Error booking job:", error);

    }
};

const rebook = async (jobNumber, id, label, userID, propertyInspectorID, selectedDate) => {
    const jobQuery = updateBookingJob();
    const jobParams = [
        id, // status id for rebook
        dateToday,
        format(selectedDate, 'yyyy-MM-dd HH:mm:ss'),
        "%" + jobNumber + "%", // job number pattern
    ];

    const bookParams = [
        jobNumber,
        label,
        userID,
        propertyInspectorID,
        dateToday,
        "Property Inspector updated the status to " + label,
        dateToday,
        dateToday,
    ];

    try {
        await insertOrUpdateData(jobQuery, jobParams);
        await insertOrUpdateData(bookingQuery, bookParams);

    } catch (error) {
        console.error("Error booking job:", error);

    }
}

export default BookingService;