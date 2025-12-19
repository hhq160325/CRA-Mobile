export interface DriverLicenseSectionProps {
    licenseImage?: string | null;
    licenseStatus?: string | null;
    licenseCreateDate?: string | null;
    onUploadLicense: () => void;
}

export interface EditFieldModalProps {
    visible: boolean;
    editingField: string | null;
    editValue: string;
    isSaving: boolean;
    onValueChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export interface PasswordVerificationModalProps {
    visible: boolean;
    password: string;
    isPasswordSecure: boolean;
    isSaving: boolean;
    pendingField: string | null;
    onPasswordChange: (password: string) => void;
    onToggleSecure: () => void;
    onVerify: () => void;
    onCancel: () => void;
}

export interface ChangePasswordModalProps {
    visible: boolean;
    userEmail: string;
    onClose: () => void;
    onLogout?: () => void;
}