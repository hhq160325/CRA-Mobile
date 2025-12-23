
export function formatPrice(price: number): string {
    if (price === 0) return '0 VND';

    // Convert to string and add dots as thousand separators
    const priceStr = Math.round(price).toString();
    const formatted = priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formatted} VND`;
}


export function formatPriceNumber(price: number): string {
    if (price === 0) return '0';

    const priceStr = Math.round(price).toString();
    return priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}