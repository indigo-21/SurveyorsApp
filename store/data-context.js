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
    const [dashboardValues, setDashboardValues] = useState({
        currentVisits: 0,
        questionSets: 0,
        completedVisits: 0,
        bookJobs: 0,
    });

    function storeDashboardValues(data) {
        // Support both previous array-based API and new counts-object API
        if (Array.isArray(data)) {
            setDashboardValues((prevState) => ({
                ...prevState,
                currentVisits: data[0].length,
                questionSets: data[1].length,
                bookJobs: data[2].length,
                completedVisits: data[3].length,
            }));
            return;
        }

        if (data && typeof data === 'object') {
            setDashboardValues((prevState) => ({
                ...prevState,
                currentVisits: typeof data.currentVisits === 'number' ? data.currentVisits : prevState.currentVisits,
                questionSets: typeof data.questionSets === 'number' ? data.questionSets : prevState.questionSets,
                bookJobs: typeof data.bookJobs === 'number' ? data.bookJobs : prevState.bookJobs,
                completedVisits: typeof data.completedVisits === 'number' ? data.completedVisits : prevState.completedVisits,
            }));
            return;
        }
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