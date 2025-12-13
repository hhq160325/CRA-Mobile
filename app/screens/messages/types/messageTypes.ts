export interface MessageItem {
    id: string;
    title: string;
    content: string;
    createDate: string;
    updateDate: string;
    status: string;
    type: string;
    senderId: string;
    receiverId: string;
}

export interface CarOwnerInfo {
    ownerId: string;
    ownerUsername: string;
    carName: string;
}

export interface MessageFormData {
    title: string;
    content: string;
}