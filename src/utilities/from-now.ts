export const fromNow = (date: string) => {
    const now = new Date();
    const submittedAt = new Date(date);
    const diff = Math.abs(now.getTime() - submittedAt.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

    return `${days} day${days > 1 ? 's' : ''} ago`;
}