fetch('http://localhost:8082/ecotacna/api/health/delete-test-user', { method: 'GET' })
  .then(res => res.text().then(text => console.log(res.status, text)))
  .catch(err => console.error('Fetch error:', err.message));
