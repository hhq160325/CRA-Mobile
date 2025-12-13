import type { AdditionalFee } from '../types/additionalPaymentTypes';

export const ADDITIONAL_FEES: AdditionalFee[] = [
    {
        id: 'overtime',
        name: 'Overtime Fee',
        amount: 70000,
        description: 'VND 70,000/hour - Late return surcharge. Over 5 hours = extra day.',
        icon: 'schedule',
    },
    {
        id: 'cleaning',
        name: 'Cleaning Fee',
        amount: 70000,
        description: 'VND 70,000 - Unsanitary return (stains, mud, etc.)',
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