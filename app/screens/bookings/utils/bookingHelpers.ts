import { colors } from '../../../theme/colors';

export const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};

export const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'upcoming':
        case 'pending':
            return '#FFA500';
        case 'completed':
            return '#00B050';
        case 'cancelled':
            return '#EF4444';
        default:
            return colors.placeholder;
    }
};

export const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'upcoming':
            return 'Upcoming';
        case 'pending':
            return 'Pending';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
};
