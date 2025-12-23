import type { AdditionalFee } from '../types/additionalPaymentTypes';

export const ADDITIONAL_FEES: AdditionalFee[] = [
    {
        id: 'overtime',
        name: 'Overtime Fee',
        amount: 500000,
        description: 'VND 500,000/hour - Late return surcharge. Editable hours.',
        icon: 'schedule',
        isEditable: true,
        unit: 'hour',
        minQuantity: 1,
        maxQuantity: 24,
    },
    {
        id: 'cleaning',
        name: 'Cleaning Fee',
        amount: 100000,
        description: 'VND 100,000 - Unsanitary return (stains, mud, etc.)',
        icon: 'cleaning-services',
    },
    {
        id: 'deodorization',
        name: 'Deodorization Fee',
        amount: 500000,
        description: 'VND 500,000 - Unpleasant odor (smoke, food smell, etc.)',
        icon: 'air',
    },
];