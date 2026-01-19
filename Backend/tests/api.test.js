import { test } from 'node:test';
import assert from 'node:assert';

const API_URL = 'http://localhost:4000/api';
const CREDENTIALS = {
  email: 'alok@gmail.com',
  password: '123'
};

let authToken = '';
let createdUserId = '';

test('1. Auth: Login', async (t) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS)
    });
    
    if (!res.ok) {
        const txt = await res.text();
        console.error('Login failed response:', txt);
        throw new Error(`Login failed: ${res.status}`);
    }

    const data = await res.json();
    assert.strictEqual(res.status, 200, 'Login failed');
    assert.ok(data.accessToken, 'No access token returned');
    
    authToken = data.accessToken;
  } catch (err) {
      console.error('Ensure the backend server is running on port 4000');
      throw err;
  }
});

test('2. Users: Create User', async (t) => {
    const newUser = {
        name: 'Test User Automated',
        email: `testuser_${Date.now()}@example.com`,
        password: 'password123',
        role: 'EMPLOYEE',
        teamId: null,
        managerId: null,
        level: 'L1',
        yearlyTarget: 50000
    };

    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newUser)
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create user failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.name, newUser.name);
    createdUserId = data.id;
});

test('3. Users: List Users (Caching Check)', async (t) => {
  const start = Date.now();
  const res1 = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data1 = await res1.json();
  assert.strictEqual(res1.status, 200);
  const time1 = Date.now() - start;

  const start2 = Date.now();
  const res2 = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data2 = await res2.json();
  assert.strictEqual(res2.status, 200);
  const time2 = Date.now() - start2;

  console.log(`\n  API Response Time - First: ${time1}ms, Second (Cached): ${time2}ms`);
  assert.ok(data1.data.length > 0);
});

test('4. Users: Update User', async (t) => {
    const updatePayload = {
        name: 'Updated Test User'
    };

    const res = await fetch(`${API_URL}/users/${createdUserId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updatePayload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.name, 'Updated Test User');
});

test('5. Users: Delete User', async (t) => {
    const res = await fetch(`${API_URL}/users/${createdUserId}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${authToken}`
        }
    });

    assert.strictEqual(res.status, 204);
});
