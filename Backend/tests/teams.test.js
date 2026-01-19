import { test } from 'node:test';
import assert from 'node:assert';

const API_URL = 'http://localhost:4000/api';
const CREDENTIALS = {
  email: 'alok@gmail.com',
  password: '123'
};

let authToken = '';
let createdTeamId = '';

test('1. Auth: Login', async (t) => {
  const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
  });
  
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  authToken = data.accessToken;
});

test('2. Teams: Create Team', async (t) => {
    const newTeam = {
        name: `Team Alpha ${Date.now()}`,
        color: 'blue',
        yearlyTarget: 1000000
    };

    const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newTeam)
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create team failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.name, newTeam.name);
    createdTeamId = data.id;
});

test('3. Teams: List Teams', async (t) => {
    const res = await fetch(`${API_URL}/teams`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.find(t => t.id === createdTeamId));
});

test('4. Teams: Delete Team', async (t) => {
    const res = await fetch(`${API_URL}/teams/${createdTeamId}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${authToken}`
        }
    });

    assert.strictEqual(res.status, 204);
});
