import client from './client';

export async function analyzeInterview(formData) {
  const response = await client.post('/analyze-interview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getResults(skip = 0, limit = 50) {
  const response = await client.get('/results', {
    params: { skip, limit },
  });
  return response.data;
}

export async function getResult(id) {
  const response = await client.get(`/results/${id}`);
  return response.data;
}
