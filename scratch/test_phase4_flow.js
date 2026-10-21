import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Windows/.gemini/antigravity-ide/brain/d6caf19b-3920-478c-b114-6e9ae1cf9eed';

async function run() {
  console.log('Starting Phase 4 E2E testing...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // 1. Visit Catalog
  console.log('Step 1: Navigating to /shop...');
  await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_01_shop.png'), fullPage: false });

  // 2. Click on the first Karambit "Añadir al Carrito" or open modal
  console.log('Step 2: Adding Karambit to Cart...');
  const addButtons = await page.$$('button');
  let clickedAdd = false;
  for (const btn of addButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Añadir al Carrito') || text.includes('Personalizar')) {
      await btn.click();
      clickedAdd = true;
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // If modal opened, click "Añadir al Carrito" inside modal
  const modalButtons = await page.$$('button');
  for (const btn of modalButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Añadir al Carrito')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // 3. Open Cart Drawer by clicking cart icon
  console.log('Step 3: Opening Cart Drawer...');
  await page.evaluate(() => {
    // Open cart drawer directly via store or UI
    const cartBtn = document.querySelector('button[aria-label="Carrito de compras"]') || document.querySelector('button:has(svg)');
    if (cartBtn) cartBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_02_cart_drawer.png'), fullPage: false });

  // 4. Click Checkout button in CartDrawer or navigate directly
  console.log('Step 4: Navigating to /checkout...');
  await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_03_checkout_initial.png'), fullPage: false });

  // 5. Click "⚡ Autocompletar Tarjeta de Prueba"
  console.log('Step 5: Testing Autocomplete Test Card...');
  const buttonsOnCheckout = await page.$$('button');
  for (const btn of buttonsOnCheckout) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Autocompletar Tarjeta')) {
      await btn.click();
      console.log('Clicked Autocompletar Tarjeta de Prueba!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // 6. Test 3D Flip
  console.log('Step 6: Testing 3D Card Flip...');
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Girar Tarjeta')) {
      await btn.click();
      console.log('Clicked Girar Tarjeta!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_04_card_flipped.png'), fullPage: false });

  // Flip back
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Ver Cara Delantera')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // 7. Click "PAGAR AHORA"
  console.log('Step 7: Clicking PAGAR AHORA...');
  let paid = false;
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('PAGAR AHORA')) {
      await btn.click();
      paid = true;
      console.log('Clicked PAGAR AHORA!');
      break;
    }
  }

  // 8. Wait for processing modal to complete (3.5s + buffer)
  console.log('Step 8: Waiting for sequential processing modal to complete (~4s)...');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_05_processing_modal.png'), fullPage: false });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Current URL after payment:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_06_order_success.png'), fullPage: false });

  // 9. Navigate to /orders
  console.log('Step 9: Navigating to /orders (Arsenal IRL)...');
  await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_07_orders_arsenal.png'), fullPage: false });

  // 10. Click "Inspeccionar en Grande"
  console.log('Step 10: Testing Knife Inspection modal...');
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Inspeccionar')) {
      await btn.click();
      console.log('Clicked Inspeccionar en Grande!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_08_knife_inspect.png'), fullPage: false });

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 11. Switch to "Historial de Pedidos y Facturas"
  console.log('Step 11: Testing History tab...');
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text.includes('Historial de Pedidos')) {
      await btn.click();
      console.log('Clicked Historial de Pedidos tab!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4_09_orders_history.png'), fullPage: false });

  await browser.close();
  console.log('Phase 4 E2E test finished successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
