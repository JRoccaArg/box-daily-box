import type {Page} from '@playwright/test';

export async function mockV2Api(page:Page, options:{status?:number;rank?:number;balance?:number;authenticated?:boolean;noAttempts?:boolean}={}) {
 const summaryRequests:Array<{token:string|undefined;url:string}>=[];
 const id='00000000-0000-4000-8000-000000000000';
 await page.addInitScript(({authenticated})=>{
  if(authenticated) localStorage.setItem('boxbox:v1:identity_token',JSON.stringify('visual-test-token'));
  else localStorage.removeItem('boxbox:v1:identity_token');
  sessionStorage.clear();
  let seed=42;
  Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 },{authenticated:options.authenticated!==false});
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname.replace(/^\/api/,'');
  let status=200;
  let body:unknown={};
  if(path==='/health') body={status:'ok',timestamp:'2026-01-15T12:00:00Z'};
  else if(path.endsWith('/summary')) {
   summaryRequests.push({token:route.request().headers()['x-identity-token'],url:route.request().url()});
   status=options.status??200;
   body=status===200?{today:'2026-01-15',won:12,lost:3,todayWon:2,todayPlayed:3,currentStreak:7,bestStreak:9,lastDays:[]}:{error:'INTERNAL SQL details and secret-test-token must never appear'};
  } else if(path.endsWith('/rank')) body={dateKey:'2026-01-15',rank:options.rank??1020,points:500,totalPlayers:2000};
  else if(path.endsWith('/attempts')) body={dateKey:'2026-01-15',attempts:(options.noAttempts?[]:['pittexto','polewordle','team-radio']).map((gameId,i)=>({gameId,difficulty:'facil',won:i!==2,timeSeconds:30,points:i===2?0:100,dateKey:'2026-01-15',finishedAt:'2026-01-15T10:00:00Z'}))};
  else if(path.endsWith('/badges')) body={userId:id,counts:{},owned:[],featured:null,achievements:[]};
  else if(path.startsWith('/ranking/')) body={period:'2026-01',total:2000,offset:0,limit:1,top:[],me:{userId:id,displayName:'VisualTest',countryCode:'ARG',rank:1020,points:500,daysPlayed:7,gamesWon:2,currentStreak:7,displayBadges:[]}};
  else if(path==='/me/lives') body={balance:options.balance??2,earnedToday:false};
  else if(path==='/duels/pending') body={duels:[]};
  else if(path.includes('/friends')) body={friends:[],requests:[]};
  else if(path==='/me/friend-code') body={code:'BDBTST01'};
  else if(path==='/username-available') body={available:true};
  else if(path.startsWith('/user/')) body={userId:id,displayName:'VisualTest',countryCode:null,canChangeName:true,nameChangedAt:null};
  else status=404;
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 });
 return summaryRequests;
}
