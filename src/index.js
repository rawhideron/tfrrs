const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

async function scrapeTripleJumpData() {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add these arguments for Linux
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to TFRRS...');
        // Navigate to TFRRS and wait until network is idle
        await page.goto('https://tf.tfrrs.org', { 
            waitUntil: 'networkidle0',
            timeout: 60000 
        });

        console.log('Waiting for search input...');
        // Wait for search input to be visible
        await page.waitForSelector('input[type="text"]', { timeout: 60000 });

        console.log('Typing search query...');
        await page.type('input[type="text"]', 'Cole Goodman');
        await page.keyboard.press('Enter');

        console.log('Waiting for results...');
        // Increase timeout and add visible: true option
        await page.waitForSelector('.results-link', { 
            timeout: 60000,
            visible: true 
        });

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
            path: path.join('/home', 'rongoodman', 'Projects', 'tfrrs_data', 'cole_goodman_triple_jump.csv'),
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