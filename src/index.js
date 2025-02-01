const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

async function scrapeTripleJumpData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navigate to TFRRS
        await page.goto('https://tf.tfrrs.org');

        // Search for 'Cole Goodman'
        await page.type('input[type="text"]', 'Cole Goodman');
        await page.keyboard.press('Enter');

        // Wait for results
        await page.waitForSelector('.results-link');

        // Get triple jump results
        const results = await page.evaluate(() => {
            const entries = document.querySelectorAll('.performance-row');
            return Array.from(entries)
                .filter(entry => entry.textContent.includes('Triple Jump'))
                .map(entry => ({
                    date: entry.querySelector('.date')?.textContent.trim(),
                    meet: entry.querySelector('.meet-name')?.textContent.trim(),
                    mark: entry.querySelector('.mark')?.textContent.trim(),
                    wind: entry.querySelector('.wind')?.textContent.trim() || 'N/A',
                    place: entry.querySelector('.place')?.textContent.trim()
                }));
        });

        // Create CSV file
        const csvWriter = createCsvWriter({
            path: path.join('C:', 'Users', 'Rawhi', 'Documents', 'cole_goodman_tripple_jump.csv'),
            header: [
                {id: 'date', title: 'Date'},
                {id: 'meet', title: 'Meet'},
                {id: 'mark', title: 'Mark'},
                {id: 'wind', title: 'Wind'},
                {id: 'place', title: 'Place'}
            ]
        });

        await csvWriter.writeRecords(results);
        console.log('CSV file has been created successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

scrapeTripleJumpData();