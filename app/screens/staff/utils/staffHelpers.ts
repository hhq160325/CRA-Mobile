import { carsService } from '../../../../lib/api/services/cars.service';
import { userService } from '../../../../lib/api/services/user.service';
import { scheduleService } from '../../../../lib/api/services/schedule.service';
import { API_CONFIG } from '../../../../lib/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (e) {
        console.error('Error getting auth token:', e);
        return null;
    }
};

export const fetchBookingWithCarDetails = async (bookingNumber: string) => {
    try {
        console.log(` fetchBookingWithCarDetails: fetching booking details for: ${bookingNumber}`);
        const baseUrl = API_CONFIG.BASE_URL;
        const url = `/Booking/GetBookingsByBookNum/${bookingNumber}`;
        const fullUrl = `${baseUrl}${url}`;
        const token = await getAuthToken();

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const bookingData = await response.json();
            console.log(` fetchBookingWithCarDetails: success for ${bookingNumber}:`, {
                hasCarData: !!bookingData.car,
                carModel: bookingData.car?.model,
                carManufacturer: bookingData.car?.manufacturer
            });
            return bookingData;
        } else {
            console.error(` fetchBookingWithCarDetails: API error for ${bookingNumber}:`, response.status);
        }
    } catch (err) {
        console.error(` fetchBookingWithCarDetails: Exception for ${bookingNumber}:`, err);
    }
    return null;
};

export const fetchCarDetails = async (carId: string) => {
    try {
        console.log(` fetchCarDetails: fetching car details for ID: ${carId}`);
        const carResult = await carsService.getCarById(carId);

        console.log(` fetchCarDetails: result for ${carId}:`, {
            hasData: !!carResult.data,
            hasError: !!carResult.error,
            carName: carResult.data?.name,
            carBrand: carResult.data?.brand,
            carModel: carResult.data?.model,
            error: carResult.error?.message
        });

        if (carResult.data) {
            const details = {
                carName: carResult.data.name || 'Unknown Car',
                carBrand: carResult.data.brand || '',
                carModel: carResult.data.model || '',
                carLicensePlate: carResult.data.licensePlate || '',
                carImage: carResult.data.image || '',
            };
            console.log(` fetchCarDetails: returning details for ${carId}:`, details);
            return details;
        }

        if (carResult.error) {
            console.error(` fetchCarDetails: API error for ${carId}:`, carResult.error.message);
        }
    } catch (err) {
        console.error(` fetchCarDetails: Exception for ${carId}:`, err);
    }

    console.log(` fetchCarDetails: returning default "Unknown Car" for ${carId}`);
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
        const token = await getAuthToken();

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

        if (checkInResult.data && Array.isArray(checkInResult.data.images) && checkInResult.data.images.length > 0) {
            hasCheckIn = true;
        }
    } catch (err) {

        console.log(`Check-in status for booking ${bookingId}: No data available`);
    }

    try {
        const checkOutResult = await scheduleService.getCheckOutImages(bookingId);

        if (checkOutResult.data && Array.isArray(checkOutResult.data.images) && checkOutResult.data.images.length > 0) {
            hasCheckOut = true;
        }
    } catch (err) {

        console.log(`Check-out status for booking ${bookingId}: No data available`);
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

// Batch fetching functions for performance optimization
export const batchFetchCarDetails = async (carIds: string[]): Promise<Map<string, any>> => {
    const carDetailsMap = new Map();

    if (carIds.length === 0) return carDetailsMap;

    console.log(` batchFetchCarDetails: fetching ${carIds.length} cars`);

    // Fetch all cars in parallel with limited concurrency
    const batchSize = 5; // Limit concurrent requests
    for (let i = 0; i < carIds.length; i += batchSize) {
        const batch = carIds.slice(i, i + batchSize);
        const promises = batch.map(async (carId) => {
            try {
                const details = await fetchCarDetails(carId);
                return { carId, details };
            } catch (error) {
                console.error(` batchFetchCarDetails: error for ${carId}:`, error);
                return {
                    carId,
                    details: {
                        carName: 'Unknown Car',
                        carBrand: '',
                        carModel: '',
                        carLicensePlate: '',
                        carImage: '',
                    }
                };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ carId, details }) => {
            carDetailsMap.set(carId, details);
        });
    }

    console.log(` batchFetchCarDetails: completed ${carDetailsMap.size} cars`);
    return carDetailsMap;
};

export const batchFetchUserDetails = async (userIds: string[]): Promise<Map<string, string>> => {
    const userDetailsMap = new Map();

    if (userIds.length === 0) return userDetailsMap;

    console.log(` batchFetchUserDetails: fetching ${userIds.length} users`);

    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const promises = batch.map(async (userId) => {
            try {
                const name = await fetchCustomerName(userId);
                return { userId, name };
            } catch (error) {
                console.error(` batchFetchUserDetails: error for ${userId}:`, error);
                return { userId, name: 'Customer' };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ userId, name }) => {
            userDetailsMap.set(userId, name);
        });
    }

    console.log(` batchFetchUserDetails: completed ${userDetailsMap.size} users`);
    return userDetailsMap;
};

export const batchFetchPaymentDetails = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const paymentDetailsMap = new Map();

    if (bookingIds.length === 0) return paymentDetailsMap;

    console.log(` batchFetchPaymentDetails: fetching ${bookingIds.length} payments`);

    const batchSize = 5;
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const details = await fetchPaymentDetails(bookingId);
                return { bookingId, details };
            } catch (error) {
                console.error(` batchFetchPaymentDetails: error for ${bookingId}:`, error);
                return { bookingId, details: { amount: 0, status: 'pending' } };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, details }) => {
            paymentDetailsMap.set(bookingId, details);
        });
    }

    console.log(` batchFetchPaymentDetails: completed ${paymentDetailsMap.size} payments`);
    return paymentDetailsMap;
};

export const batchFetchCheckInOutStatus = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const checkInOutMap = new Map();

    if (bookingIds.length === 0) return checkInOutMap;

    console.log(` batchFetchCheckInOutStatus: fetching ${bookingIds.length} check-in/out statuses`);

    const batchSize = 5;
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const status = await fetchCheckInOutStatus(bookingId);
                return { bookingId, status };
            } catch (error) {
                console.error(` batchFetchCheckInOutStatus: error for ${bookingId}:`, error);
                return { bookingId, status: { hasCheckIn: false, hasCheckOut: false } };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, status }) => {
            checkInOutMap.set(bookingId, status);
        });
    }

    console.log(` batchFetchCheckInOutStatus: completed ${checkInOutMap.size} statuses`);
    return checkInOutMap;
};

export const batchFetchExtensionInfo = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const extensionInfoMap = new Map();

    if (bookingIds.length === 0) return extensionInfoMap;

    console.log(` batchFetchExtensionInfo: fetching ${bookingIds.length} extension infos`);

    const batchSize = 3; // Lower batch size for extension info as it makes 2 API calls per booking
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const info = await fetchBookingExtensionInfo(bookingId);
                return { bookingId, info };
            } catch (error) {
                console.error(`🔍 batchFetchExtensionInfo: error for ${bookingId}:`, error);
                return {
                    bookingId,
                    info: {
                        hasExtension: false,
                        extensionDescription: undefined,
                        extensionDays: undefined,
                        extensionAmount: undefined
                    }
                };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, info }) => {
            extensionInfoMap.set(bookingId, info);
        });
    }

    console.log(` batchFetchExtensionInfo: completed ${extensionInfoMap.size} extension infos`);
    return extensionInfoMap;
};

export const fetchBookingExtensionInfo = async (bookingId: string) => {
    try {
        console.log(` fetchBookingExtensionInfo: Step 1 - Getting booking details for ${bookingId}`);


        const baseUrl = API_CONFIG.BASE_URL;
        const bookingUrl = `${baseUrl}/Booking/GetBookingById/${bookingId}`;
        const token = await getAuthToken();

        const bookingResponse = await fetch(bookingUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        if (!bookingResponse.ok) {
            console.log(` fetchBookingExtensionInfo: Failed to get booking details for ${bookingId}, status: ${bookingResponse.status}`);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        const bookingData = await bookingResponse.json();
        const invoiceId = bookingData.invoiceId;

        if (!invoiceId) {
            console.log(` fetchBookingExtensionInfo: No invoiceId found for booking ${bookingId}`);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        console.log(` fetchBookingExtensionInfo: Step 1 completed - Got invoiceId: ${invoiceId} for booking ${bookingId}`);


        const invoiceBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const paymentUrl = `${invoiceBaseUrl}/Invoice/${invoiceId}`;

        console.log(` fetchBookingExtensionInfo: Step 2 - Getting payment details for ${invoiceId}`);
        console.log(` fetchBookingExtensionInfo: Full payment URL: ${paymentUrl}`);

        const paymentResponse = await fetch(paymentUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        console.log(` fetchBookingExtensionInfo: Payment response status: ${paymentResponse.status}`);

        if (!paymentResponse.ok) {
            console.log(` fetchBookingExtensionInfo: Failed to get payment details for ${invoiceId}, status: ${paymentResponse.status}`);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        const paymentData = await paymentResponse.json();
        console.log(` fetchBookingExtensionInfo: Step 2 completed - Got payment data for ${invoiceId}`);
        console.log(` fetchBookingExtensionInfo: Payment data:`, JSON.stringify(paymentData, null, 2));


        if (!Array.isArray(paymentData)) {
            console.log(` fetchBookingExtensionInfo: Payment data is not an array:`, typeof paymentData);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }


        const extensionPayment = paymentData.find((payment: any) =>
            payment.item === 'Booking Extension'
        );

        if (!extensionPayment) {
            console.log(` fetchBookingExtensionInfo: No "Booking Extension" payment found in invoice ${invoiceId}`);
            console.log(` fetchBookingExtensionInfo: Available payment items:`, paymentData.map((p: any) => p.item));
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        console.log(` fetchBookingExtensionInfo: Found booking extension payment for ${bookingId}:`, {
            paymentId: extensionPayment.id,
            item: extensionPayment.item,
            paidAmount: extensionPayment.paidAmount,
            status: extensionPayment.status
        });


        const extensionDescription = `Booking Extension (${extensionPayment.paidAmount.toLocaleString()} VND)`;
        const extensionDays = 1;
        const extensionAmount = extensionPayment.paidAmount || 0;

        return {
            hasExtension: true,
            extensionDescription,
            extensionDays,
            extensionAmount
        };

    } catch (error) {
        console.error(` fetchBookingExtensionInfo: error for ${bookingId}:`, error);
        return {
            hasExtension: false,
            extensionDescription: undefined,
            extensionDays: undefined,
            extensionAmount: undefined
        };
    }
};
