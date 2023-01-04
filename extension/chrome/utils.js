/* Fetch function */

async function fetchUrl(auth, url, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' }
  
    if (auth) {
      headers.Authorization = auth;
    }
  
    try {
      const response = await fetch(url, { method, credentials: 'include', headers, body })
  
      if (!response.ok) {
        throw Error(`HTTP Code: ${response.status}`);
      }
  
      return await response.json();
    } catch (err) {
      throw new Error(`Failed performing request, reload the site and try again.\n\n${method} ${url}\n${err}`);
    }
  }