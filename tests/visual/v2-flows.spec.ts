import {test,expect} from './fixtures';
import {mockV2Api} from './v2-api';

test('profile loads authenticated stats and fetches detailed charts only when opened',async({page})=>{
 const requests=await mockV2Api(page);
 await page.goto('/es/perfil');
 await expect(page.locator('.stats-ribbon')).toContainText('12');
 await expect(page.locator('.stats-ribbon')).toContainText('80%');
 expect(requests.some(r=>r.token==='visual-test-token')).toBe(true);
 await expect(page.locator('.points-chart')).toHaveCount(0);
 await page.getByText('Ver estadísticas en detalle',{exact:true}).click();
 await expect(page.getByRole('img',{name:'Puntos personales por día del mes'})).toBeVisible();
 await page.getByRole('link',{name:'Perfil y cuenta',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Tu identidad.'})).toBeVisible();
 await page.getByRole('button',{name:/^País:/}).click();
 await expect(page.getByRole('textbox',{name:'Buscar país'})).toBeVisible();
});

for(const status of [403,500]) test(`profile handles HTTP ${status} without exposing backend details`,async({page})=>{
 await mockV2Api(page,{status});
 await page.goto('/es/perfil');
 await expect(page.locator('.error-scene')).toBeVisible();
 await expect(page.locator('body')).not.toContainText('INTERNAL SQL');
 await expect(page.locator('body')).not.toContainText('secret-test-token');
 await expect(page.locator('.stats-ribbon')).toHaveCount(0);
 await expect(page.getByRole(status===403?'link':'button',{name:status===403?'Iniciar sesión':'Reintentar',exact:true})).toBeVisible();
});

test('home handles a very large rank without shifting the header and hides zero lives',async({page})=>{
 await mockV2Api(page,{rank:123456789,balance:0});
 await page.goto('/es/');
 const rank=page.locator('.home-rank');
 await expect(rank).toHaveAttribute('title','#123.456.789');
 await expect(rank).toContainText('Ver puesto');
 expect((await rank.boundingBox())!.width).toBeLessThanOrEqual(150);
 await expect(page.locator('.v2-header-life')).toHaveCount(0);
});

test('home navigation, legal pages and cookie choices work at every viewport',async({page})=>{
 await mockV2Api(page);
 await page.goto('/es/');
 const menu=page.getByRole('button',{name:'Abrir menú'});
 if((page.viewportSize()?.width??1280)<=640) {
  await menu.click();
  await expect(page.locator('#v2-mobile-menu')).toBeVisible();
  await page.locator('#v2-mobile-menu').getByRole('link',{name:'Clasificación',exact:true}).click();
 }else await page.locator('.navlinks').getByRole('link',{name:'Clasificación'}).click();
 await expect(page).toHaveURL(/\/es\/ranking$/);
 await page.getByRole('link',{name:'Términos y Condiciones',exact:true}).click();
 await expect(page.locator('.document-body')).toBeVisible();
 await expect(page.locator('.document-body').getByRole('heading').first()).toBeVisible();
 await page.getByRole('button',{name:'Gestionar cookies'}).click();
 await expect(page.locator('.cookie-preview')).toBeVisible();
 await page.locator('.cookie-preview button').first().click();
 await expect(page.locator('.cookie-preview')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('the circuit accent follows the selected driver and stays yellow with safety car',async({page})=>{
 await mockV2Api(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/es/?circuit=monaco&safety=0');
 const driver=page.locator('.track-driver').first();
 await driver.click();
 const color=await driver.locator('circle').evaluate(e=>getComputedStyle(e).fill);
 await expect(page.locator('.hero-period')).toHaveCSS('color',color);
 await page.goto('/es/?circuit=monaco&safety=1');
 await expect(page.locator('.safety-status')).toBeVisible();
 const safetyColor=await page.locator('.safety-car circle').evaluate(e=>getComputedStyle(e).fill);
 await expect(page.locator('.hero-period')).toHaveCSS('color',safetyColor);
});
