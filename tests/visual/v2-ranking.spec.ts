import {test,expect} from './fixtures';
import {mockV2Api} from './v2-api';

test('the monthly ranking only shows the current month: no period picker there',async({page})=>{
 await mockV2Api(page);
 await page.goto('/es/ranking');
 await expect(page.locator('.v2-period-input')).toHaveCount(1);
 await page.getByRole('button',{name:'Mensual'}).click();
 await expect(page.locator('.v2-period-input')).toHaveCount(0);
 await page.getByRole('button',{name:'Anual'}).click();
 await expect(page.locator('.v2-period-input')).toHaveCount(1);
});

test('the red header underline follows the current page, not the first link',async({page})=>{
 test.skip((page.viewportSize()?.width??1280)<=640,'the links live in the mobile menu on small screens');
 await mockV2Api(page);
 const underline=(name:string)=>page.locator('.navlinks').getByRole('link',{name,exact:true}).evaluate(e=>getComputedStyle(e,'::after').content);
 await page.goto('/es/ranking');
 await expect(page.locator('.navlinks').getByRole('link',{name:'Ranking',exact:true})).toHaveAttribute('aria-current','page');
 expect(await underline('Juegos diarios')).toBe('none');
 expect(await underline('Ranking')).not.toBe('none');
 await page.goto('/es/');
 expect(await underline('Juegos diarios')).not.toBe('none');
 expect(await underline('Ranking')).toBe('none');
});

test('the country filter opens without moving the board and every country can be reached',async({page})=>{
 await mockV2Api(page);
 await page.goto('/es/ranking');
 await page.locator('.country-filter').click();
 const popover=page.locator('.v2-picker-popover');
 await expect(popover).toBeVisible();
 const board=page.locator('.rank-board');
 expect(await board.evaluate(e=>e.scrollLeft)).toBe(0);
 await expect(board).toHaveCSS('overflow-x','visible');
 const box=(await popover.boundingBox())!;
 expect(box.x).toBeGreaterThanOrEqual(0);
 expect(box.x+box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
 const list=page.locator('.v2-picker-list');
 expect((await list.boundingBox())!.height).toBeGreaterThan(200);
 // El tablero queda corto (sin filas): la lista no debe quedar recortada por él.
 const reachable=await list.evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,Math.min(r.bottom-4,innerHeight-2))?.closest('.v2-picker-list');});
 expect(reachable).toBe(true);
 await list.evaluate(e=>{e.scrollTop=e.scrollHeight;});
 await expect(popover).toBeVisible();
 const last=list.getByRole('option').last();
 await last.click();
 await expect(popover).toHaveCount(0);
});

test('daily progress pips start without colour and turn red as games are completed',async({page})=>{
 test.skip((page.viewportSize()?.width??1280)<=1000,'the pips are hidden on narrow screens');
 await mockV2Api(page,{noAttempts:true});
 await page.goto('/es/');
 const pips=page.locator('.progress-pips i');
 await expect(pips).toHaveCount(8);
 for(let i=0;i<8;i++){
  await expect(pips.nth(i)).toHaveCSS('background-color','rgb(51, 50, 57)');
  await expect(pips.nth(i)).toHaveCSS('animation-name','none');
 }
 await expect(page.locator('.progress-games strong')).toContainText('0 de 8');
});

test('each completed game paints exactly one pip red',async({page})=>{
 test.skip((page.viewportSize()?.width??1280)<=1000,'the pips are hidden on narrow screens');
 await mockV2Api(page);
 await page.goto('/es/');
 await expect.poll(async()=>pips(page),{message:'pips follow the completed counter'}).toBe(true);
 async function pips(p:typeof page){
  const state=await p.locator('.progress-pips i').evaluateAll(els=>els.map(e=>({done:e.classList.contains('is-complete'),bg:getComputedStyle(e).backgroundColor})));
  const done=state.filter(s=>s.done).length;
  const label=(await p.locator('.progress-games strong').textContent())??'';
  return done>0&&label.startsWith(`${done} `)&&state.every(s=>s.bg===(s.done?'rgb(225, 6, 0)':'rgb(51, 50, 57)'));
 }
});
