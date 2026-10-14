const fs=require('fs');const sharp=require(process.cwd()+'/node_modules/sharp');
(async()=>{
const mark=fs.readFileSync('public/anvaya-mark.svg');
for(const [name,size] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]])await sharp(mark).resize(size,size).png().toFile('public/brand/'+name);
const wordmark=`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="112" viewBox="0 0 420 112"><rect width="420" height="112" rx="24" fill="#F5F3EF"/><svg x="12" y="8" width="96" height="96" viewBox="0 0 128 128">${mark.toString().replace(/^.*?<svg[^>]*>/s,'').replace(/<\/svg>\s*$/,'')}</svg><text x="128" y="73" font-family="sans-serif" font-weight="700" font-size="57" letter-spacing="-3" fill="#24211E">anvaya<tspan fill="#9A532F">.</tspan></text></svg>`;
fs.writeFileSync('public/brand/anvaya-wordmark.svg',wordmark);
const og=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#F5F3EF"/><circle cx="1060" cy="180" r="300" fill="#E8D8C5"/><path d="M870 460 1020 185l150 275m-240-80h180" stroke="#9A532F" stroke-width="32" stroke-linecap="round" fill="none"/><text x="72" y="135" font-family="sans-serif" font-size="50" font-weight="700" fill="#9A532F">anvaya.</text><text x="72" y="290" font-family="sans-serif" font-size="62" font-weight="700" fill="#24211E">Connected learning.</text><text x="72" y="375" font-family="sans-serif" font-size="62" font-weight="700" fill="#24211E">Grounded preparation.</text><text x="76" y="520" font-family="sans-serif" font-size="26" fill="#756E66">Exam tracks / Shared subjects / Practice</text></svg>`;
await sharp(Buffer.from(og)).png().toFile('app/opengraph-image.png');
})();
