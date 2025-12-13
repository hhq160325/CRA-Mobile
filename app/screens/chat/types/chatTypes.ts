export interface ChatHead {
    userId: string;
    username: string;
    carName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    carId: string;
}

export interface Message {
    id: string;
    title: string | null;
    content: string;
    createDate: string;
    updateDate: string;
    status: string;
    type: string;
    senderId: string;
    receiverId: string;
    parentInquiryId: string | null;
    imageUrls: string[];
}