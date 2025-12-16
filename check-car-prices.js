// Script to check which cars are missing prices
const { carsService } = require('./lib/api');

async function checkCarPrices() {
    console.log('Fetching all cars to check for missing prices...\n');

    try {
        const result = await carsService.getAllCars();

        if (!result.data) {
            console.log('No car data found or error occurred');
            return;
        }

        const allCars = result.data;
        const carsWithoutPrice = allCars.filter(car => car.price <= 0);
        const carsWithPrice = allCars.filter(car => car.price > 0);

        console.log(`Total cars: ${allCars.length}`);
        console.log(`Cars with prices: ${carsWithPrice.length}`);
        console.log(`Cars missing prices: ${carsWithoutPrice.length}\n`);

        if (carsWithoutPrice.length > 0) {
            console.log('Cars missing prices (showing "Price on request"):');
            console.log('='.repeat(60));

            carsWithoutPrice.forEach((car, index) => {
                console.log(`${index + 1}. ${car.manufacturer} ${car.model}`);
                console.log(`   ID: ${car.id}`);
                console.log(`   Category: ${car.category || 'N/A'}`);
                console.log(`   Year: ${car.year || car.yearofManufacture || 'N/A'}`);
                console.log(`   Status: ${car.status || 'N/A'}`);
                console.log(`   Current Price: ${car.price}`);
                console.log('');
            });
        } else {
            console.log('All cars have prices set! ✅');
        }

        if (carsWithPrice.length > 0) {
            console.log('\nCars with prices (sample):');
            console.log('='.repeat(40));

            carsWithPrice.slice(0, 5).forEach((car, index) => {
                console.log(`${index + 1}. ${car.manufacturer} ${car.model}: ${car.price.toLocaleString()} VND/day`);
            });

            if (carsWithPrice.length > 5) {
                console.log(`... and ${carsWithPrice.length - 5} more cars with prices`);
            }
        }

    } catch (error) {
        console.error('Error fetching car data:', error);
    }
}

checkCarPrices();