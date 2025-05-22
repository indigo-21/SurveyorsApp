import { createContext, useState } from "react";

export const DataContext = createContext({
    dashboardValues: {
        currentVisits: 0,
        questionSets: 0,
        completedVisits: 0,
        bookJobs: 0,
    },
    storeDashboardValues: (data) => { },
});

function DataContextProvider({ children }) {
    const [dashboardValues, setDashboardValues] = useState([]);

    function storeDashboardValues(data) {
        setDashboardValues((prevState) => ({
            ...prevState,
            currentVisits: data[0].length,
            questionSets: data[1].length,
            bookJobs: data[2].length,
        }));
    }

    const contextValue = {
        dashboardValues: dashboardValues,
        storeDashboardValues: storeDashboardValues,

    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
}

export default DataContextProvider;