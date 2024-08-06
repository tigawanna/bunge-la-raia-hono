export function timestampToDays(timestampString: string|null) {
    if (!timestampString) {
        return 0;
    }
    // Convert timestamp string to a JavaScript Date object
    const timestamp = new Date(timestampString);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Date.now() - timestamp.getTime();

    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    // Check if the difference is approximately X days
    return differenceInDays;
}
