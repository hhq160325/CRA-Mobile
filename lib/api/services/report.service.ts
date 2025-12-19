import { API_CONFIG } from "../config";

export interface CreateReportData {
    title: string;
    content: string;
    carId: string;
    userId: string;
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

export const reportService = {
    async createReport(data: CreateReportData): Promise<{ data: ReportResponse | null; error: Error | null }> {
        console.log("reportService.createReport: creating report", {
            title: data.title,
            carId: data.carId,
            userId: data.userId,
            contentLength: data.content.length
        });

        try {
            const formData = new FormData();
            formData.append('Title', data.title);
            formData.append('Content', data.content);
            formData.append('CarId', data.carId);
            formData.append('UserId', data.userId);

            const response = await fetch(
                'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/Report',
                {
                    method: 'POST',
                    headers: {
                        'accept': '*/*',
                    },
                    body: formData,
                }
            );

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
    }
};

export type { CreateReportData, ReportResponse };