# Hướng dẫn nhập ngày tháng (Date Input Guide)

## Cách hoạt động

### Khi mở form nhập ngày:
- Hiển thị: `__/__/____`
- Người dùng chỉ cần gõ số, không cần gõ dấu `/`

### Ví dụ nhập liệu:

#### Nhập ngày sinh (Date of Birth):
1. Mở form → Hiển thị: `__/__/____`
2. Gõ `0` → Hiển thị: `0_/__/____`
3. Gõ `9` → Hiển thị: `09/__/____`
4. Gõ `1` → Hiển thị: `09/1_/____`
5. Gõ `0` → Hiển thị: `09/10/____`
6. Gõ `2` → Hiển thị: `09/10/2___`
7. Gõ `0` → Hiển thị: `09/10/20__`
8. Gõ `2` → Hiển thị: `09/10/202_`
9. Gõ `5` → Hiển thị: `09/10/2025`

### Tính năng:
- ✅ Tự động thêm dấu `/` ở đúng vị trí
- ✅ Chỉ cho phép nhập số (0-9)
- ✅ Giới hạn tối đa 8 chữ số
- ✅ Hiển thị format `DD/MM/YYYY`
- ✅ Gửi đến API format `YYYY-MM-DD`

### Validation:
- **Ngày sinh (Date of Birth)**:
  - Phải là ngày trong quá khứ
  - Người dùng phải từ 18 tuổi trở lên
  
- **Ngày hết hạn giấy phép (License Expiry)**:
  - Phải là ngày trong tương lai

### Chuyển đổi format:
- **Người dùng nhập**: `09/10/2025` (DD/MM/YYYY)
- **Gửi đến API**: `2025-10-09` (YYYY-MM-DD)
- **Nhận từ API**: `2025-10-09` (YYYY-MM-DD)
- **Hiển thị cho người dùng**: `09/10/2025` (DD/MM/YYYY)

## Code Implementation

### Format với mask:
```typescript
const formatDateWithMask = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  let result = '';
  const mask = '__/__/____';
  let cleanedIndex = 0;
  
  for (let i = 0; i < mask.length && cleanedIndex < cleaned.length; i++) {
    if (mask[i] === '_') {
      result += cleaned[cleanedIndex];
      cleanedIndex++;
    } else {
      result += mask[i];
    }
  }
  
  if (result.length < mask.length) {
    result += mask.slice(result.length);
  }
  
  return result;
};
```

### Xử lý input:
```typescript
const handleEditValueChange = (text: string) => {
  if (editingField === 'dateOfBirth' || editingField === 'licenseExpiry') {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 8) {
      const formatted = formatDateWithMask(digits);
      setEditValue(formatted);
    }
  } else {
    setEditValue(text);
  }
};
```

### Chuyển đổi sang API format:
```typescript
// Từ DD/MM/YYYY sang YYYY-MM-DD
const [day, month, year] = value.split('/');
const apiValue = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
```
