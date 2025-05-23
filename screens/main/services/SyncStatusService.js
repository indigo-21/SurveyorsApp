let isSyncReady = false;

export const setSyncReady = (ready) => {
    isSyncReady = ready;
};

export const getSyncReady = () => {
    return isSyncReady;
};