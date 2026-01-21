import { carsService } from '../../../../lib/api/services/cars.service';
import { userService } from '../../../../lib/api/services/user.service';
import { scheduleService } from '../../../../lib/api/services/schedule.service';
import { API_CONFIG } from '../../../../lib/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCache, cacheKeys } from '../../../../lib/api/cache';

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

    const cacheKey = cacheKeys.car(carId);
    const cached = apiCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const carResult = await carsService.getCarById(carId);

        if (carResult.data) {
            const details = {
                carName: carResult.data.name || 'Unknown Car',
                carBrand: carResult.data.brand || '',
                carModel: carResult.data.model || '',
                carLicensePlate: carResult.data.licensePlate || '',
                carImage: carResult.data.image || '',
            };


            apiCache.set(cacheKey, details, 60 * 60 * 1000);

            return details;
        }

        if (carResult.error) {
            // console.error(` fetchCarDetails: API error for ${carId}:`, carResult.error.message);
        }
    } catch (err) {
        // console.error(` fetchCarDetails: Exception for ${carId}:`, err);
    }

    const defaultDetails = {
        carName: 'Unknown Car',
        carBrand: '',
        carModel: '',
        carLicensePlate: '',
        carImage: '',
    };


    apiCache.set(cacheKey, defaultDetails, 10 * 60 * 1000);

    return defaultDetails;
};

export const fetchCustomerName = async (userId: string) => {

    const cacheKey = cacheKeys.user(userId);
    const cached = apiCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const userResult = await userService.getUserById(userId);
        if (userResult.data) {
            const name = userResult.data.fullname || userResult.data.username || 'Customer';

            apiCache.set(cacheKey, name, 60 * 60 * 1000);
            return name;
        }
    } catch (err) {
        // console.error('Error fetching customer name:', err);
    }

    const defaultName = 'Customer';

    apiCache.set(cacheKey, defaultName, 10 * 60 * 1000);
    return defaultName;
};

export const fetchPaymentDetails = async (bookingId: string) => {

    const cacheKey = cacheKeys.staffPaymentDetails(bookingId);
    const cached = apiCache.get(cacheKey);
    if (cached) {
        if (__DEV__) {
            console.log(` fetchPaymentDetails: Using CACHED data for ${bookingId} (age: ${Math.round((Date.now() - (cached as any).timestamp) / 1000)}s)`);
        }
        return cached;
    }

    if (__DEV__) {
        console.log(` fetchPaymentDetails: Making FRESH API call for ${bookingId} (no cache or cache invalidated)`);
    }

    try {
        const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const paymentsUrl = `${baseUrl}/Booking/${bookingId}/Payments`;
        const token = await getAuthToken();


        if (__DEV__) {
            console.log(` fetchPaymentDetails: Checking payments for booking ${bookingId}`);
        }


        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(paymentsUrl, {
            method: 'GET',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const paymentsData = await response.json();

            if (__DEV__) {
                console.log(` fetchPaymentDetails: Payments data for ${bookingId}:`, JSON.stringify(paymentsData, null, 2));
            }

            if (Array.isArray(paymentsData) && paymentsData.length > 0) {

                const bookingFeePayment = paymentsData.find(p =>
                    p.item === 'Booking Fee'
                );
                const rentalFeePayment = paymentsData.find(p =>
                    p.item === 'Rental Fee'
                );
                const extensionPayment = paymentsData.find(p =>
                    p.item === 'Booking Extension'
                );
                const additionalFeePayment = paymentsData.find(p =>
                    p.item === 'Additional Fee'
                );

                console.log(` fetchPaymentDetails: Payment filtering for ${bookingId}:`);
                if (__DEV__) {
                    // console.log(`- Booking Fee Payment:`, bookingFeePayment ? `${bookingFeePayment.item} (${bookingFeePayment.status})` : 'None');
                    // console.log(`- Rental Fee Payment:`, rentalFeePayment ? `${rentalFeePayment.item} (${rentalFeePayment.status})` : 'None');
                    // console.log(`- Extension Payment:`, extensionPayment ? `${extensionPayment.item} (${extensionPayment.status})` : 'None');
                    // console.log(`- Additional Fee Payment:`, additionalFeePayment ? `${additionalFeePayment.item} (${additionalFeePayment.status})` : 'None');
                }


                let totalAmount = 0;
                [bookingFeePayment, rentalFeePayment, extensionPayment, additionalFeePayment].forEach(payment => {
                    if (payment) {
                        totalAmount += Number(payment.paidAmount) || 0;
                    }
                });

                const isBookingFeePaid = bookingFeePayment &&
                    (bookingFeePayment.status === 'Success' ||
                        bookingFeePayment.status === 'Paid' ||
                        bookingFeePayment.status === 'Completed');


                const isRentalFeePaid = rentalFeePayment &&
                    (rentalFeePayment.status === 'Success' ||
                        rentalFeePayment.status === 'Paid' ||
                        rentalFeePayment.status === 'Completed');

                console.log(` fetchPaymentDetails: Payment status analysis for ${bookingId}:`);
                if (__DEV__) {
                    // console.log(`- Booking fee payment exists:`, !!bookingFeePayment);
                    // console.log(`- Booking fee payment status:`, bookingFeePayment?.status);
                    // console.log(`- Is booking fee paid:`, isBookingFeePaid);
                    // console.log(`- Rental fee payment exists:`, !!rentalFeePayment);
                    // console.log(`- Rental fee payment status:`, rentalFeePayment?.status);
                    // console.log(`- Is rental fee paid:`, isRentalFeePaid);
                }

                const isExtensionPaid = !extensionPayment ||
                    (extensionPayment.status === 'Success' ||
                        extensionPayment.status === 'Paid' ||
                        extensionPayment.status === 'Completed');

                const isAdditionalFeePaid = !additionalFeePayment ||
                    (additionalFeePayment.status === 'Success' ||
                        additionalFeePayment.status === 'Paid' ||
                        additionalFeePayment.status === 'Completed');



                let overallStatus = 'pending';

                if (!rentalFeePayment) {

                    if (isBookingFeePaid) {
                        overallStatus = 'booking_paid';
                        if (__DEV__) console.log(`fetchPaymentDetails: Booking fee paid for ${bookingId} - rental payment needed`);
                    } else {
                        overallStatus = 'no_payment';
                        if (__DEV__) console.log(`fetchPaymentDetails: No payments found for ${bookingId}`);
                    }
                } else if (rentalFeePayment && !isRentalFeePaid) {

                    overallStatus = 'rental_pending';
                    if (__DEV__) console.log(`fetchPaymentDetails: Rental fee payment exists but pending for ${bookingId} - customer needs to pay`);
                } else if (rentalFeePayment && isRentalFeePaid) {

                    overallStatus = 'paid';
                    if (__DEV__) console.log(`fetchPaymentDetails: Rental fee is paid for ${bookingId} - ready for pickup`);
                } else {

                    overallStatus = 'pending';
                    if (__DEV__) console.log(` fetchPaymentDetails: Fallback status for ${bookingId} - pending`);
                }

                const result = {
                    amount: totalAmount,
                    status: overallStatus,
                    hasPaymentRecord: !!(bookingFeePayment || rentalFeePayment || extensionPayment || additionalFeePayment),

                    isBookingFeePaid,
                    isRentalFeePaid: !!isRentalFeePaid,
                    isExtensionPaid,
                    isAdditionalFeePaid,
                    hasExtension: !!extensionPayment,

                    bookingFeePayment,
                    rentalFeePayment,
                    extensionPayment,
                    additionalFeePayment,
                };
                console.log(` fetchPaymentDetails: Returning for ${bookingId}:`, result);


                apiCache.set(cacheKey, result, 15 * 60 * 1000);
                return result;
            }
        } else {
            console.log(` fetchPaymentDetails: API call failed for ${bookingId} with status ${response.status}`);
        }


        if (__DEV__) console.log(` fetchPaymentDetails: No payments found for ${bookingId} - returning no_payment`);
        const noPaymentResult = {
            amount: 0,
            status: 'no_payment',
            hasPaymentRecord: false,
            isBookingFeePaid: false,
            isRentalFeePaid: false,
            isExtensionPaid: true,
            isAdditionalFeePaid: true,
            hasExtension: false,
            rentalFeePayment: null,
            extensionPayment: null,
        };


        apiCache.set(cacheKey, noPaymentResult, 10 * 60 * 1000);
        return noPaymentResult;

    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.log(` fetchPaymentDetails: Request timeout for ${bookingId}`);
        } else {
            console.error(` fetchPaymentDetails: Error for ${bookingId}:`, err);
        }


        if (__DEV__) console.log(` fetchPaymentDetails: Returning no_payment for ${bookingId} due to error/failure`);
        const errorResult = {
            amount: 0,
            status: 'no_payment',
            hasPaymentRecord: false,
            isBookingFeePaid: false,
            isRentalFeePaid: false,
            isExtensionPaid: true,
            isAdditionalFeePaid: true,
            hasExtension: false,
            rentalFeePayment: null,
            extensionPayment: null,
        };


        apiCache.set(cacheKey, errorResult, 5 * 60 * 1000);
        return errorResult;
    }
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


export const batchFetchCarDetails = async (carIds: string[]): Promise<Map<string, any>> => {
    const carDetailsMap = new Map();

    if (carIds.length === 0) return carDetailsMap;


    const timeout = 3000;
    const promises = carIds.map(async (carId) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const fetchPromise = fetchCarDetails(carId);
            const details = await Promise.race([fetchPromise, timeoutPromise]);
            return { carId, details };
        } catch (error) {
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

    return carDetailsMap;
};

export const batchFetchUserDetails = async (userIds: string[]): Promise<Map<string, string>> => {
    const userDetailsMap = new Map();

    if (userIds.length === 0) return userDetailsMap;


    const timeout = 3000;
    const promises = userIds.map(async (userId) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const fetchPromise = fetchCustomerName(userId);
            const name = await Promise.race([fetchPromise, timeoutPromise]);
            return { userId, name };
        } catch (error) {
            return { userId, name: 'Customer' };
        }
    });

    const results = await Promise.all(promises);
    results.forEach(({ userId, name }) => {
        userDetailsMap.set(userId, name);
    });

    return userDetailsMap;
};

export const batchFetchPaymentDetails = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const paymentDetailsMap = new Map();

    if (bookingIds.length === 0) return paymentDetailsMap;


    const batchSize = 20;
    const timeout = 5000;

    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), timeout)
                );

                const fetchPromise = fetchPaymentDetails(bookingId);
                const details = await Promise.race([fetchPromise, timeoutPromise]);
                return { bookingId, details };
            } catch (error) {

                return {
                    bookingId,
                    details: {
                        amount: 0,
                        status: 'no_payment',
                        hasPaymentRecord: false,
                        isBookingFeePaid: false,
                        isRentalFeePaid: false,
                        isExtensionPaid: true,
                        isAdditionalFeePaid: true,
                        hasExtension: false,
                    }
                };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, details }) => {
            paymentDetailsMap.set(bookingId, details);

            // Log payment mapping for debugging
            if (__DEV__) {
                console.log(`💰 ${bookingId.substring(0, 8)}: RentalPaid=${(details as any).isRentalFeePaid}, Status=${(details as any).status}`);
            }
        });
    }

    return paymentDetailsMap;
};

export const batchFetchCheckInOutStatus = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const checkInOutMap = new Map();

    if (bookingIds.length === 0) return checkInOutMap;


    const timeout = 4000;
    const promises = bookingIds.map(async (bookingId) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            const fetchPromise = fetchCheckInOutStatus(bookingId);
            const status = await Promise.race([fetchPromise, timeoutPromise]);
            return { bookingId, status };
        } catch (error) {
            return { bookingId, status: { hasCheckIn: false, hasCheckOut: false } };
        }
    });

    const results = await Promise.all(promises);
    results.forEach(({ bookingId, status }) => {
        checkInOutMap.set(bookingId, status);

        // Log check-in/out mapping for debugging
        if (__DEV__) {
            console.log(`🚪 ${bookingId.substring(0, 8)}: CheckIn=${(status as { hasCheckIn: boolean; hasCheckOut: boolean }).hasCheckIn}, CheckOut=${(status as { hasCheckIn: boolean; hasCheckOut: boolean }).hasCheckOut}`);
        }
    });

    return checkInOutMap;
};

export const batchFetchExtensionInfo = async (bookingIds: string[]): Promise<Map<string, any>> => {
    const extensionInfoMap = new Map();

    if (bookingIds.length === 0) return extensionInfoMap;


    const batchSize = 8;
    const timeout = 6000;

    for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const promises = batch.map(async (bookingId) => {
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Extension fetch timeout')), timeout)
                );

                const fetchPromise = fetchBookingExtensionInfo(bookingId);
                const info = await Promise.race([fetchPromise, timeoutPromise]);
                return { bookingId, info };
            } catch (error) {

                return {
                    bookingId,
                    info: {
                        hasExtension: false,
                        extensionDescription: undefined,
                        extensionDays: undefined,
                        extensionAmount: undefined,
                        extensionPaymentStatus: undefined,
                        isExtensionPaymentCompleted: false
                    }
                };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ bookingId, info }) => {
            extensionInfoMap.set(bookingId, info);
        });
    }

    return extensionInfoMap;
};

export const fetchBookingExtensionInfo = async (bookingId: string) => {
    try {
        // console.log(` fetchBookingExtensionInfo: Step 1 - Getting booking details for ${bookingId}`);


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


        try {
            const directInvoiceUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}/${invoiceId}`;
            console.log(` fetchBookingExtensionInfo: Step 2 - Trying direct invoice endpoint: ${directInvoiceUrl}`);

            const directInvoiceResponse = await fetch(directInvoiceUrl, {
                method: 'GET',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'accept': '*/*'
                },
            });

            if (directInvoiceResponse.ok) {
                const directInvoiceData = await directInvoiceResponse.json();
                console.log(` fetchBookingExtensionInfo: Direct invoice data:`, JSON.stringify(directInvoiceData, null, 2));

                // Check if invoice has invoiceItems array with Booking Extension
                if (directInvoiceData.invoiceItems && Array.isArray(directInvoiceData.invoiceItems)) {
                    const extensionItem = directInvoiceData.invoiceItems.find((item: any) =>
                        item.item === 'Booking Extension'
                    );

                    if (extensionItem) {
                        console.log(` fetchBookingExtensionInfo: Found extension in direct invoice items:`, extensionItem);
                        return {
                            hasExtension: true,
                            extensionDescription: `Booking Extension - ${extensionItem.description || 'Extended rental period'}`,
                            extensionDays: extensionItem.quantity || 1,
                            extensionAmount: extensionItem.total || extensionItem.unitPrice || 0,
                            extensionPaymentStatus: 'Paid',
                            isExtensionPaymentCompleted: true
                        };
                    }
                }
            } else {
                console.log(` fetchBookingExtensionInfo: Direct invoice endpoint failed: ${directInvoiceResponse.status}`);
            }
        } catch (directError) {
            console.log(` fetchBookingExtensionInfo: Direct invoice endpoint error:`, directError);
        }


        // console.log(` fetchBookingExtensionInfo: Step 3 - Checking invoice items for ${invoiceId}`);

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


        const invoiceBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
        const timestamp = new Date().getTime();
        const paymentUrl = `${invoiceBaseUrl}/Invoice/${invoiceId}?_t=${timestamp}`;

        // console.log(` fetchBookingExtensionInfo: Step 4 - Getting payment details for ${invoiceId}`);
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
        // console.log(` fetchBookingExtensionInfo: Step 4 completed - Got payment data for ${invoiceId}`);
        // console.log(` fetchBookingExtensionInfo: Payment data:`, JSON.stringify(paymentData, null, 2));


        if (paymentData.invoiceItems && Array.isArray(paymentData.invoiceItems)) {
            const extensionItem = paymentData.invoiceItems.find((item: any) =>
                item.item === 'Booking Extension'
            );

            if (extensionItem) {
                // console.log(` fetchBookingExtensionInfo: Found extension in invoice items from payment endpoint:`, extensionItem);
                return {
                    hasExtension: true,
                    extensionDescription: `Booking Extension - ${extensionItem.description || 'Extended rental period'}`,
                    extensionDays: extensionItem.quantity || 1,
                    extensionAmount: extensionItem.total || extensionItem.unitPrice || 0,
                    extensionPaymentStatus: 'Paid',
                    isExtensionPaymentCompleted: true
                };
            }
        }


        if (!Array.isArray(paymentData)) {
            // console.log(` fetchBookingExtensionInfo: Payment data is not an array:`, typeof paymentData);
            return {
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined
            };
        }


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


        const extensionDescription = `${extensionPayment.item} (${extensionPayment.paidAmount?.toLocaleString()} VND)`;


        let extensionDays = 1; // Default to 1 day


        const description = extensionPayment.item || '';
        const dayMatch = description.match(/(\d+)\s*days?/i);
        if (dayMatch) {
            extensionDays = parseInt(dayMatch[1], 10) || 1;
        }


        if (extensionPayment.description) {
            const descDayMatch = extensionPayment.description.match(/(\d+)\s*days?/i);
            if (descDayMatch) {
                extensionDays = parseInt(descDayMatch[1], 10) || extensionDays;
            }
        }

        console.log(` fetchBookingExtensionInfo: Extracted extension days: ${extensionDays} from description: "${description}"`);

        const extensionAmount = extensionPayment.paidAmount || 0;


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
