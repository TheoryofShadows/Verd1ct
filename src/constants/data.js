export const MARKETS = [
  { id:1,  cat:"Sports",  ico:"⚾",  q:"Will the Yankees win the 2026 World Series?",       yes:.34, vol:12.4,  chg: 3.2, end:"Oct 31",  mesh:98, ai:97, chat:342,  heat:"fire", sp:[28,30,27,32,35,33,34], src:"MLB Official Results",           yH:8420,  nH:14210 },
  { id:2,  cat:"Politics",ico:"🏛️", q:"Will the Fed cut rates in June 2026?",               yes:.62, vol:45.1,  chg:-1.8, end:"Jun 18",  mesh:95, ai:94, chat:1205, heat:"up",   sp:[55,58,61,64,60,63,62], src:"Federal Reserve Press Release",  yH:32100, nH:19800 },
  { id:3,  cat:"Crypto",  ico:"₿",  q:"Bitcoin exceeds $200K by year end?",                yes:.21, vol:78.3,  chg: 5.7, end:"Dec 31",  mesh:92, ai:91, chat:2890, heat:"fire", sp:[15,14,18,20,19,22,21], src:"CoinGecko + CMC Avg",            yH:45600, nH:12300 },
  { id:4,  cat:"Culture", ico:"🎬", q:"Will any film gross $2B worldwide?",                 yes:.45, vol:8.7,   chg:  .5, end:"Dec 31",  mesh:96, ai:93, chat:156,  heat:"",     sp:[42,40,43,44,46,44,45], src:"Box Office Mojo",               yH:5200,  nH:6400  },
  { id:5,  cat:"Econ",    ico:"📊", q:"US unemployment stays below 4.5%?",                 yes:.71, vol:22.6,  chg: -.3, end:"Dec 31",  mesh:99, ai:98, chat:478,  heat:"",     sp:[68,70,72,69,71,70,71], src:"Bureau of Labor Statistics",    yH:18900, nH:7800  },
  { id:6,  cat:"Tech",    ico:"🤖", q:"Apple ships consumer AR glasses in 2026?",          yes:.38, vol:15.9,  chg: 8.1, end:"Dec 31",  mesh:94, ai:89, chat:891,  heat:"up",   sp:[25,28,30,33,35,36,38], src:"Apple Official Keynote",         yH:11200, nH:18400 },
  { id:7,  cat:"Sports",  ico:"🏀", q:"Celtics repeat as NBA champions?",                  yes:.28, vol:19.2,  chg: 2.1, end:"Jun 20",  mesh:97, ai:96, chat:623,  heat:"fire", sp:[22,24,25,27,26,28,28], src:"NBA Official Results",           yH:9300,  nH:24100 },
  { id:8,  cat:"Climate", ico:"🌡️", q:"2026 is the hottest year on record?",               yes:.56, vol:6.3,   chg: 1.2, end:"Jan '27", mesh:99, ai:97, chat:89,   heat:"",     sp:[48,50,52,54,55,55,56], src:"NASA GISS + NOAA",              yH:4100,  nH:3200  },
  { id:9,  cat:"Tech",    ico:"🧪", q:"Major AI lab releases AGI-level model?",            yes:.15, vol:34.2,  chg: 4.3, end:"Dec 31",  mesh:86, ai:85, chat:3100, heat:"fire", sp:[8,10,12,11,14,13,15],  src:"Expert Panel + Benchmarks",    yH:21000, nH:42000 },
  { id:10, cat:"Tech",    ico:"🚀", q:"SpaceX lands Starship on Mars?",                    yes:.05, vol:11.8,  chg:  .8, end:"Dec 31",  mesh:99, ai:99, chat:1400, heat:"up",   sp:[3,4,4,5,5,5,5],        src:"SpaceX + NASA Confirmation",   yH:3200,  nH:58000 },
]

export const CATS = ["All","Sports","Politics","Crypto","Econ","Tech","Culture","Climate"]

export const LEADERS = [
  { r:1, n:"SilentEdge",  roi:"+342%", str:18, av:"👑", pnl:34200 },
  { r:2, n:"DataPulse",   roi:"+289%", str:14, av:"📈", pnl:28900 },
  { r:3, n:"GlassJaw",    roi:"+254%", str:12, av:"🔮", pnl:25400 },
  { r:4, n:"ZeroDelta",   roi:"+231%", str:11, av:"🧠", pnl:23100 },
  { r:5, n:"Contrarian",  roi:"+198%", str:9,  av:"🎯", pnl:19800 },
]

export const LOGS = [
  { mkt:"Super Bowl LX Winner",  res:"YES — Chiefs",       ai:"YES", jury:"97.2%", paid:"$34.2M", hash:"0x7a3f…c91d" },
  { mkt:"Oscars Best Picture",   res:"YES — The Diplomat", ai:"YES", jury:"94.1%", paid:"$8.1M",  hash:"0x2b8e…f04a" },
  { mkt:"March CPI > 3%",        res:"NO",                 ai:"NO",  jury:"98.8%", paid:"$18.7M", hash:"0x91c2…b77e" },
  { mkt:"Trump AI exec order Q1",res:"YES",                ai:"YES", jury:"99.1%", paid:"$22.4M", hash:"0x4df1…8a2c" },
]
