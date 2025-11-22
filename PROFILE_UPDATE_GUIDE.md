# Profile Update Implementation

## User Data Structure
Based on the backend API, the user object has these fields:
```json
{
  "id": "019a9f03-d063-79a6-937c-0611d4f49f12",
  "username": "Do",
  "password": "Do-16022001",
  "phoneNumber": "0986745321",
  "email": "Do12@gmail.com",
  "fullname": null,
  "address": null,
  "imageAvatar": null,
  "isGoogle": false,
  "googleId": null,
  "isCarOwner": false,
  "rating": 0,
  "status": "Pending",
  "roleId": 1,
  "gender": 0,
  "dateOfBirth": null,
  "licenseNumber": null,
  "licenseExpiry": null
}
```

## Update Endpoint
- **URL**: `https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/User/UpdateUserInfo`
- **Method**: PUT
- **Content-Type**: application/json

## Field Mappings
The app uses these field mappings when updating:

| App Field | API Field | Type | Notes |
|-----------|-----------|------|-------|
| phone | phoneNumber | string | |
| email | email | string | Requires password verification |
| username | username | string | |
| fullname | fullname | string | |
| address | address | string | |
| gender | gender | number | 0=Male, 1=Female, 2=Other |
| dateOfBirth | dateOfBirth | string | Format: YYYY-MM-DD |
| licenseNumber | licenseNumber | string | 12 digits |
| licenseExpiry | licenseExpiry | string | Format: YYYY-MM-DD |

## Date Format Handling
- **User Input**: DD/MM/YYYY (e.g., 09/10/2025)
- **API Format**: YYYY-MM-DD (e.g., 2025-10-09)
- **Conversion**: Automatic conversion happens in `handleSaveField`

## Date Input Features
1. **Masked Input**: Shows `__/__/____` format
2. **Auto-formatting**: User types `09102025` → displays `09/10/2025`
3. **Validation**: 
   - Date of Birth: Must be in past, user must be 18+
   - License Expiry: Must be in future

## Update Request Format
```json
{
  "id": "user-id-here",
  "fieldName": "value"
}
```

Example updating date of birth:
```json
{
  "id": "019a9f03-d063-79a6-937c-0611d4f49f12",
  "dateOfBirth": "2001-02-16"
}
```

## Security
- Email and phone number updates require password verification
- Password is verified by attempting login with current credentials
