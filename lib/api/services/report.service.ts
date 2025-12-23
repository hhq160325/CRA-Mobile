import { API_CONFIG, API_ENDPOINTS } from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (e) {
        console.error("Failed to get token:", e);
        return null;
    }
};

export interface CreateReportData {
    title: string;
    content: string;
    carId: string;
    userId: string;
}

export interface CreateUserReportData {
    title: string;
    content: string;
    deductedPoints: number;
    reporterId: string;
    reportedUserId: string;
}

export interface ReportResponse {
    id: string;
    reportNo: string;
    title: string;
    content: string;
    createDate: string;
    status: string;
    carId: string;
    userId: string;
}

export interface UserReportResponse {
    id: string;
    reportNo: string;
    title: string;
    content: string;
    deductedPoints: number;
    createDate: string;
    status: string;
    reporterId: string;
    reportedUserId: string;
}

export const reportService = {
    async createReport(data: CreateReportData): Promise<{ data: ReportResponse | null; error: Error | null }> {
        console.log("reportService.createReport: creating report", {
            title: data.title,
            carId: data.carId,
            userId: data.userId,
            contentLength: data.content.length
        });

        try {
            // Get authentication token
            const token = await getAuthToken();
            console.log('🔐 Report: Auth token available:', !!token);

            const formData = new FormData();
            formData.append('Title', data.title);
            formData.append('Content', data.content);
            formData.append('ReporterId', data.userId);
            formData.append('ReportedCarId', data.carId);

            console.log("reportService.createReport: using correct endpoint /Report/reportedCar");
            console.log("reportService.createReport: FormData fields", {
                Title: data.title,
                Content: data.content.substring(0, 50) + (data.content.length > 50 ? "..." : ""),
                ReporterId: data.userId,
                ReportedCarId: data.carId
            });

            const headers: Record<string, string> = {
                'accept': '*/*',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_REPORT}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            console.log("reportService.createReport: response status", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("reportService.createReport: error response", errorText);
                return {
                    data: null,
                    error: new Error(`Failed to create report: ${response.status} - ${errorText}`)
                };
            }

            const result = await response.json() as ReportResponse;

            console.log("reportService.createReport: success", {
                reportId: result.id,
                reportNo: result.reportNo,
                status: result.status,
                createDate: result.createDate
            });

            return { data: result, error: null };
        } catch (error) {
            console.error("reportService.createReport: caught error", error);
            return { data: null, error: error as Error };
        }
    },

    async createUserReport(data: CreateUserReportData): Promise<{ data: UserReportResponse | null; error: Error | null }> {
        console.log("reportService.createUserReport: creating user report", {
            title: data.title,
            reporterId: data.reporterId,
            reportedUserId: data.reportedUserId,
            deductedPoints: data.deductedPoints,
            contentLength: data.content.length
        });

        try {
            // Get authentication token
            const token = await getAuthToken();
            console.log('🔐 UserReport: Auth token available:', !!token);

            const formData = new FormData();
            formData.append('Title', data.title);
            formData.append('Content', data.content);
            formData.append('deductedPoints', data.deductedPoints.toString());
            formData.append('ReporterId', data.reporterId);
            formData.append('ReportedUserId', data.reportedUserId);

            console.log("reportService.createUserReport: using endpoint /Report/reportedUser");
            console.log("reportService.createUserReport: FormData fields", {
                Title: data.title,
                Content: data.content.substring(0, 50) + (data.content.length > 50 ? "..." : ""),
                deductedPoints: data.deductedPoints,
                ReporterId: data.reporterId,
                ReportedUserId: data.reportedUserId
            });

            const headers: Record<string, string> = {
                'accept': '*/*',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/Report/reportedUser`, {
                method: 'POST',
                headers,
                body: formData,
            });

            console.log("reportService.createUserReport: response status", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("reportService.createUserReport: error response", errorText);
                return {
                    data: null,
                    error: new Error(`Failed to create user report: ${response.status} - ${errorText}`)
                };
            }

            const result = await response.json() as UserReportResponse;

            console.log("reportService.createUserReport: success", {
                reportId: result.id,
                reportNo: result.reportNo,
                status: result.status,
                createDate: result.createDate,
                deductedPoints: result.deductedPoints
            });

            return { data: result, error: null };
        } catch (error) {
            console.error("reportService.createUserReport: caught error", error);
            return { data: null, error: error as Error };
        }
    }
};