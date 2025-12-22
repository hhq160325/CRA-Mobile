import { carsService } from '../../../../lib/api/services/cars.service';
import { userService } from '../../../../lib/api/services/user.service';
import { scheduleService } from '../../../../lib/api/services/schedule.service';
import { API_CONFIG } from '../../../../lib/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (e) {
        // console.error('Error getting auth token:', e);
        return null;
    }
};

export const fetchBookingWithCarDetails = async (bookingNumber: string) => {
    try {
        // console.log(` fetchBookingWithCarDetails: fetching booking details for: ${bookingNumber}`);
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
            // console.log(` fetchBookingWithCarDetails: success for ${bookingNumber}:`, {
            //     hasCarData: !!bookingData.car,
            //     carModel: bookingData.car?.model,
            //     carManufacturer: bookingData.car?.manufacturer
            // });
            return bookingData;
        } else {
            // console.error(` fetchBookingWithCarDetails: API error for ${bookingNumber}:`, response.status);
        }
    } catch (err) {
        // console.error(` fetchBookingWithCarDetails: Exception for ${bookingNumber}:`, err);
    }
    return null;
};

export const fetchCarDetails = async (carId: string) => {
    try {
        // console.log(` fetchCarDetails: fetching car details for ID: ${carId}`);
        const carResult = await carsService.getCarById(carId);

        // console.log(` fetchCarDetails: result for ${carId}:`, {
        //     hasData: !!carResult.data,
        //     hasError: !!carResult.error,
        //     carName: carResult.data?.name,
        //     carBrand: carResult.data?.brand,
        //     carModel: carResult.data?.model,
        //     error: carResult.error?.message
        // });

        if (carResult.data) {
            const details = {
                carName: carResult.data.name || 'Unknown Car',
                carBrand: carResult.data.brand || '',
                carModel: carResult.data.model || '',
                carLicensePlate: carResult.data.licensePlate || '',
                carImage: carResult.data.image || '',
            };
            // console.log(` fetchCarDetails: returning details for ${carId}:`, details);
            return details;
        }

        if (carResult.error) {
            // console.error(` fetchCarDetails: API error for ${carId}:`, carResult.error.message);
        }
    } catch (err) {
        // console.error(` fetchCarDetails: Exception for ${carId}:`, err);
    }

    // console.log(` fetchCarDetails: returning default "Unknown Car" for ${carId}`);
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
        // console.error('Error fetching customer name:', err);
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
        // console.error('Error fetching payment details:', err);
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

        // console.log(`Check-in status for booking ${bookingId}: No data available`);
    }

    try {
        const checkOutResult = await scheduleService.getCheckOutImages(bookingId);

        if (checkOutResult.data && Array.isArray(checkOutResult.data.images) && checkOutResult.data.images.length > 0) {
            hasCheckOut = true;
        }
    } catch (err) {

        // console.log(`Check-out status for booking ${bookingId}: No data available`);
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

    // console.log(` batchFetchCarDetails: fetching ${carIds.length} cars`);

    // Fetch all cars in parallel with limited concurrency
    const batchSize = 5; // Limit concurrent requests
    for (let i = 0; i < carIds.length; i += batchSize) {
        const batch = carIds.slice(i, i + batchSize);
        const promises = batch.map(async (carId) => {
            try {
                const details = await fetchCarDetails(carId);
                return { carId, details };
            } catch (error) {
                // console.error(` batchFetchCarDetails: error for ${carId}:`, error);
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

    // console.log(` batchFetchCarDetails: completed ${carDetailsMap.size} cars`);
    return carDetailsMap;
};

export const batchFetchUserDetails = async (userIds: string[]): Promise<Map<string, string>> => {
    const userDetailsMap = new Map();

    if (userIds.length === 0) return userDetailsMap;

    // console.log(` batchFetchUserDetails: fetching ${userIds.length} users`);

    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const promises = batch.map(async (userId) => {
            try {
                const name = await fetchCustomerName(userId);
                return { userId, name };
            } catch (error) {
                // console.error(` batchFetchUserDetails: error for ${userId}:`, error);
                return { userId, name: 'Customer' };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ userId, name }) => {
            userDetailsMap.set(userId, name);
        });
    }

    // console.log(` batchFetchUserDetails: completed ${userDetailsMap.size} users`);
    return userDetailsMap;
};

export const batchFetchPaymentDetails = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const paymentDetailsMap = new Map();

    if (bookingIds.length === 0) return paymentDetailsMap;

    // console.log(` batchFetchPaymentDetails: fetching ${bookingIds.length} payments`);

    const batchSize = 5;
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const details = await fetchPaymentDetails(bookingId);
                return { bookingId, details };
            } catch (error) {
                // console.error(` batchFetchPaymentDetails: error for ${bookingId}:`, error);
                return { bookingId, details: { amount: 0, status: 'pending' } };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, details }) => {
            paymentDetailsMap.set(bookingId, details);
        });
    }

    // console.log(` batchFetchPaymentDetails: completed ${paymentDetailsMap.size} payments`);
    return paymentDetailsMap;
};

export const batchFetchCheckInOutStatus = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const checkInOutMap = new Map();

    if (bookingIds.length === 0) return checkInOutMap;

    // console.log(` batchFetchCheckInOutStatus: fetching ${bookingIds.length} check-in/out statuses`);

    const batchSize = 5;
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const status = await fetchCheckInOutStatus(bookingId);
                return { bookingId, status };
            } catch (error) {
                // console.error(` batchFetchCheckInOutStatus: error for ${bookingId}:`, error);
                return { bookingId, status: { hasCheckIn: false, hasCheckOut: false } };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, status }) => {
            checkInOutMap.set(bookingId, status);
        });
    }

    // console.log(` batchFetchCheckInOutStatus: completed ${checkInOutMap.size} statuses`);
    return checkInOutMap;
};

export const batchFetchExtensionInfo = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const extensionInfoMap = new Map();

    if (bookingIds.length === 0) return extensionInfoMap;

    // console.log(` batchFetchExtensionInfo: fetching ${bookingIds.length} extension infos`);

    const batchSize = 3; // Lower batch size for extension info as it makes 2 API calls per booking
    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const info = await fetchBookingExtensionInfo(bookingId);
                return { bookingId, info };
            } catch (error) {
                // console.error(` batchFetchExtensionInfo: error for ${bookingId}:`, error);
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

    // console.log(` batchFetchExtensionInfo: completed ${extensionInfoMap.size} extension infos`);
    return extensionInfoMap;
};

export const fetchBookingExtensionInfo = async (bookingId: string) => {
    try {
        // console.log(` fetchBookingExtensionInfo: Step 1 - Getting booking details for ${bookingId}`);

        // Step 1: Get booking details
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
            // console.log(` fetchBookingExtensionInfo: Failed to get booking details for ${bookingId}, status: ${bookingResponse.status}`);
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
            // console.log(` fetchBookingExtensionInfo: No invoiceId found for booking ${bookingId}`);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        // console.log(` fetchBookingExtensionInfo: Step 1 completed - Got invoiceId: ${invoiceId} for booking ${bookingId}`);

        // Step 2: Check invoice items first (using the /api/ endpoint)
        // console.log(` fetchBookingExtensionInfo: Step 2a - Checking invoice items for ${invoiceId}`);

        const invoiceResponse = await fetch(`${baseUrl}/Invoice/${invoiceId}`, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json();
            // console.log(` fetchBookingExtensionInfo: Invoice data structure:`, JSON.stringify(invoiceData, null, 2));

            // Check if invoice has invoiceItems array with Booking Extension
            if (invoiceData.invoiceItems && Array.isArray(invoiceData.invoiceItems)) {
                const extensionItem = invoiceData.invoiceItems.find((item: any) =>
                    item.item === 'Booking Extension'
                );

                if (extensionItem) {
                    // console.log(` fetchBookingExtensionInfo: Found extension in invoice items:`, extensionItem);
                    return {
                        hasExtension: true,
                        extensionDescription: `Booking Extension - ${extensionItem.description || 'Extended rental period'}`,
                        extensionDays: extensionItem.quantity || 1,
                        extensionAmount: extensionItem.total || extensionItem.unitPrice || 0
                    };
                }
            }
        }

        // Step 3: Check payment details (using the non-/api/ endpoint)
        const invoiceBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const timestamp = new Date().getTime();
        const paymentUrl = `${invoiceBaseUrl}/Invoice/${invoiceId}?_t=${timestamp}`;

        // console.log(` fetchBookingExtensionInfo: Step 2b - Getting payment details for ${invoiceId}`);
        // console.log(` fetchBookingExtensionInfo: Full payment URL: ${paymentUrl}`);

        const paymentResponse = await fetch(paymentUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
        });

        // console.log(` fetchBookingExtensionInfo: Payment response status: ${paymentResponse.status}`);

        if (!paymentResponse.ok) {
            // console.log(` fetchBookingExtensionInfo: Failed to get payment details for ${invoiceId}, status: ${paymentResponse.status}`);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        const paymentData = await paymentResponse.json();
        // console.log(` fetchBookingExtensionInfo: Step 2b completed - Got payment data for ${invoiceId}`);
        // console.log(` fetchBookingExtensionInfo: Payment data:`, JSON.stringify(paymentData, null, 2));

        // Handle different response formats
        if (!Array.isArray(paymentData)) {
            // console.log(` fetchBookingExtensionInfo: Payment data is not an array:`, typeof paymentData);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        // Look for extension payment with various possible item names
        const possibleExtensionNames = [
            'Booking Extension',
            'booking extension',
            'Extension',
            'extension',
            'Rental Extension',
            'rental extension'
        ];

        const extensionPayment = paymentData.find((payment: any) => {
            if (!payment || !payment.item) return false;
            return possibleExtensionNames.some(name =>
                payment.item.toLowerCase().includes(name.toLowerCase())
            );
        });

        if (!extensionPayment) {
            // console.log(` fetchBookingExtensionInfo: No extension payment found in invoice ${invoiceId}`);
            // console.log(` fetchBookingExtensionInfo: Available payment items:`, paymentData.map((p: any) => p.item));

            // Check if there are any payments that might be extensions but with different names
            const allItems = paymentData.map((p: any) => p.item).join(', ');
            console.log(` fetchBookingExtensionInfo: All payment items: ${allItems}`);

            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }

        // console.log(` fetchBookingExtensionInfo: Found booking extension payment for ${bookingId}:`, {
        //     paymentId: extensionPayment.id,
        //     item: extensionPayment.item,
        //     paidAmount: extensionPayment.paidAmount,
        //     status: extensionPayment.status
        // });

        // Create extension description and extract details
        const extensionDescription = `${extensionPayment.item} (${extensionPayment.paidAmount?.toLocaleString()} VND)`;
        const extensionDays = 1; // Default to 1 day, could be extracted from description if available
        const extensionAmount = extensionPayment.paidAmount || 0;

        // Check payment status - handle both 'Success' and 'Paid'
        const paymentStatus = extensionPayment.status || 'Pending';
        const isPaymentCompleted = paymentStatus.toLowerCase() === 'success' || paymentStatus.toLowerCase() === 'paid';

        return {
            hasExtension: true,
            extensionDescription,
            extensionDays,
            extensionAmount,
            extensionPaymentStatus: paymentStatus,
            isExtensionPaymentCompleted: isPaymentCompleted
        };

    } catch (error) {
        // console.error(` fetchBookingExtensionInfo: error for ${bookingId}:`, error);
        return {
            hasExtension: false,
            extensionDescription: undefined,
            extensionDays: undefined,
            extensionAmount: undefined
        };
    }
};
