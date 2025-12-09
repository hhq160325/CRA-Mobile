import { carsService } from '../../../../lib/api/services/cars.service';
import { userService } from '../../../../lib/api/services/user.service';
import { scheduleService } from '../../../../lib/api/services/schedule.service';
import { API_CONFIG } from '../../../../lib/api/config';

export const getAuthToken = (): string | null => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
            return localStorage.getItem('token');
        }
    } catch (e) {
        console.error('Error getting auth token:', e);
    }
    return null;
};

export const fetchCarDetails = async (carId: string) => {
    try {
        const carResult = await carsService.getCarById(carId);
        if (carResult.data) {
            return {
                carName: carResult.data.name || 'Unknown Car',
                carBrand: carResult.data.brand || '',
                carModel: carResult.data.model || '',
                carLicensePlate: carResult.data.licensePlate || '',
                carImage: carResult.data.image || '',
            };
        }
    } catch (err) {
        console.error('Error fetching car details:', err);
    }
    return {
        carName: 'Unknown Car',
        carBrand: '',
        carModel: '',
        carLicensePlate: '',
        carImage: '',
    };
};

export const fetchCustomerName = async (userId: string) => {
    try {
        const userResult = await userService.getUserById(userId);
        if (userResult.data) {
            return userResult.data.fullname || userResult.data.username || 'Customer';
        }
    } catch (err) {
        console.error('Error fetching customer name:', err);
    }
    return 'Customer';
};

export const fetchPaymentDetails = async (bookingId: string) => {
    try {
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const paymentsUrl = `${baseUrl}/Booking/${bookingId}/Payments`;
        const token = getAuthToken();

        const response = await fetch(paymentsUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const paymentsData = await response.json();

            if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                const rentalFeePayment = paymentsData.find(
                    p => p.item === 'Rental Fee',
                );

                if (rentalFeePayment) {
                    return {
                        amount: Number(rentalFeePayment.paidAmount) || 0,
                        status: rentalFeePayment.status?.toLowerCase() || 'pending',
                    };
                }
            }
        }
    } catch (err) {
        console.error('Error fetching payment details:', err);
    }
    return { amount: 0, status: 'pending' };
};

export const fetchCheckInOutStatus = async (bookingId: string) => {
    let hasCheckIn = false;
    let hasCheckOut = false;

    try {
        const checkInResult = await scheduleService.getCheckInImages(bookingId);
        if (checkInResult.data && checkInResult.data.images.length > 0) {
            hasCheckIn = true;
        }
    } catch (err) {
        console.error('Error fetching check-in status:', err);
    }

    try {
        const checkOutResult = await scheduleService.getCheckOutImages(bookingId);
        if (checkOutResult.data && checkOutResult.data.images.length > 0) {
            hasCheckOut = true;
        }
    } catch (err) {
        console.error('Error fetching check-out status:', err);
    }

    return { hasCheckIn, hasCheckOut };
};

export const mapBookingStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'confirmed') {
        return 'successfully';
    } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
        return 'cancelled';
    }
    return 'pending';
};

export const formatBookingDate = (dateString: string): string => {
    const bookingDate = new Date(dateString);
    return `${bookingDate.getDate()} ${bookingDate.toLocaleString('en', { month: 'short' })}`;
};
