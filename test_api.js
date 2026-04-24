const http = require('http');

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data || '{}'));
          } else {
            resolve({ error: `HTTP ${res.statusCode}`, data });
          }
        } catch (e) {
          resolve({ error: 'Parse Error', data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function printKeys(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return typeof obj;
  if (Array.isArray(obj)) return `Array<${printKeys(obj[0], prefix)}>`;
  
  const keys = Object.keys(obj).sort();
  let result = '{\n';
  for (const k of keys) {
    result += `${prefix}  ${k}: ${printKeys(obj[k], prefix + '  ')}\n`;
  }
  result += `${prefix}}`;
  return result;
}

async function runTests() {
  console.log("=== HOTELS ===");
  try {
    const locs = await fetchJson('http://127.0.0.1:8080/api/v1/hotels/search/locations');
    console.log("Locations Type:", printKeys(locs));
    
    const search = await fetchJson('http://127.0.0.1:8080/api/v1/hotels/search?city=Damascus');
    console.log("Search Type:", printKeys(search));
    
    if (search.content && search.content.length > 0) {
      const hId = search.content[0].id;
      const detail = await fetchJson(`http://127.0.0.1:8080/api/v1/hotels/${hId}`);
      console.log("Detail Type:", printKeys(detail));
      
      const combos = await fetchJson(`http://127.0.0.1:8080/api/v1/hotels/${hId}/combinations?rooms=2:0`);
      console.log("Combinations Type:", printKeys(combos));
    }
  } catch (e) { console.error("Hotel error", e.message); }
}

runTests();
