// Worker script for Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Main request handler
async function handleRequest(request) {
  // Enable CORS
  if (request.method === 'OPTIONS') {
    return handleCors();
  }

  // Get URL path
  const url = new URL(request.url);
  const path = url.pathname;

  // Check if it's an API request
  if (path.startsWith('/api/')) {
    return handleApiRequest(request, path);
  }

  // Admin panel handling
  if (path.startsWith('/admin')) {
    return handleAdminRequest(request, path);
  }

  // For everything else, just return a 404
  return new Response('Not found', { status: 404 });
}

// Handle CORS preflight requests
function handleCors() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handle API requests
async function handleApiRequest(request, path) {
  // Extract the API endpoint
  const endpoint = path.replace('/api/', '');
  
  // Authentication endpoints
  if (endpoint === 'auth/register') {
    return handleUserRegistration(request);
  }
  
  if (endpoint === 'auth/login') {
    return handleUserLogin(request);
  }
  
  if (endpoint === 'auth/me') {
    return handleGetCurrentUser(request);
  }
  
  // Product analysis
  if (endpoint === 'analyze') {
    return handleProductAnalysis(request);
  }
  
  // User products history
  if (endpoint.match(/^users\/\d+\/products$/)) {
    return handleGetUserProducts(request, endpoint);
  }
  
  // Credit management
  if (endpoint.match(/^users\/\d+\/credits\/add$/)) {
    return handleAddCredits(request, endpoint);
  }
  
  if (endpoint.match(/^users\/\d+\/credits\/use$/)) {
    return handleUseCredit(request, endpoint);
  }
  
  // Anonymous scan tracking
  if (endpoint === 'anonymous-scans') {
    return handleAnonymousScans(request);
  }
  
  if (endpoint === 'anonymous-scans/use') {
    return handleUseAnonymousScan(request);
  }
  
  // Blog endpoints
  if (endpoint === 'blog') {
    return handleGetAllBlogPosts(request);
  }
  
  if (endpoint.match(/^blog\/\d+$/)) {
    return handleGetBlogPost(request, endpoint);
  }
  
  // Admin endpoints
  if (endpoint === 'admin/dashboard') {
    return handleAdminDashboard(request);
  }
  
  if (endpoint === 'admin/users') {
    return handleAdminUsers(request);
  }
  
  if (endpoint === 'admin/blog') {
    return handleAdminBlog(request);
  }
  
  if (endpoint.match(/^admin\/blog\/\d+$/)) {
    return handleAdminBlogPost(request, endpoint);
  }
  
  if (endpoint === 'admin/settings/ads') {
    return handleAdminAdSettings(request);
  }
  
  // Get ad settings for clients
  if (endpoint === 'settings/ads') {
    return handleGetAdSettings(request);
  }
  
  // If no matching endpoint
  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Handle user registration
async function handleUserRegistration(request) {
  try {
    // Only accept POST method
    if (request.method !== 'POST') {
      return methodNotAllowed();
    }
    
    // Parse request body
    const { firstName, lastName, email, password, country, gender } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !country || !gender) {
      return jsonResponse({ error: 'All fields are required' }, 400);
    }
    
    // Check if user already exists
    const existingUser = await env.DB.prepare(
      `SELECT * FROM users WHERE email = ?`
    ).bind(email.toLowerCase()).first();
    
    if (existingUser) {
      return jsonResponse({ error: 'User with this email already exists' }, 409);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const result = await env.DB.prepare(
      `INSERT INTO users (firstName, lastName, email, password, country, gender, credits, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      firstName,
      lastName,
      email.toLowerCase(),
      hashedPassword,
      country,
      gender,
      50 // Initial credits for new users
    ).run();
    
    // Generate JWT token
    const token = generateToken(result.lastRowId);
    
    // Return success response
    return jsonResponse({
      user: {
        id: result.lastRowId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        country,
        gender,
        credits: 50
      },
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return jsonResponse({ error: 'Registration failed' }, 500);
  }
}

// Initialize database tables
async function initializeTables() {
  // Create users table
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      country TEXT NOT NULL,
      gender TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      credits INTEGER DEFAULT 50,
      lastLogin DATETIME,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    )
  `).run();
  
  // Create anonymous_scans table
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS anonymous_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE(ip, date)
    )
  `).run();
  
  // Create product_analyses table
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS product_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      ingredients TEXT NOT NULL,
      analysis TEXT NOT NULL,
      overallRating REAL,
      ingredientCount INTEGER,
      createdAt DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `).run();
  
  // Create blog_posts table
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      imageUrl TEXT,
      status TEXT DEFAULT 'draft',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    )
  `).run();
  
  // Create app_settings table
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updatedAt DATETIME NOT NULL
    )
  `).run();

  // Create default admin user if none exists
  const adminUser = await env.DB.prepare(
    `SELECT * FROM users WHERE role = 'admin' LIMIT 1`
  ).first();
  
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await env.DB.prepare(
      `INSERT INTO users (firstName, lastName, email, password, country, gender, role, credits, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      'Admin',
      'User',
      'admin@example.com',
      hashedPassword,
      'US',
      'other',
      'admin',
      9999
    ).run();
    
    console.log('Created default admin user');
  }
}

// Handle product analysis
async function handleProductAnalysis(request) {
  try {
    if (request.method !== 'POST') {
      return methodNotAllowed();
    }
    
    // Get user ID if available
    let userId = null;
    const authUser = await authenticateUser(request);
    if (authUser) {
      userId = authUser.id;
    } else {
      // Handle anonymous user scan limits
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const currentDate = new Date().toISOString().split('T')[0];
      
      const scanRecord = await env.DB.prepare(
        `SELECT * FROM anonymous_scans WHERE ip = ? AND date = ?`
      ).bind(ip, currentDate).first();
      
      if (scanRecord && scanRecord.count >= 5) {
        return jsonResponse({ error: 'Daily anonymous scan limit reached' }, 400);
      }
      
      // Create or update anonymous scan record
      if (scanRecord) {
        await env.DB.prepare(
          `UPDATE anonymous_scans SET count = ? WHERE ip = ? AND date = ?`
        ).bind(scanRecord.count + 1, ip, currentDate).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO anonymous_scans (ip, date, count) VALUES (?, ?, 1)`
        ).bind(ip, currentDate).run();
      }
    }
    
    // Parse request body
    const { ingredients } = await request.json();
    
    if (!ingredients) {
      return jsonResponse({ error: 'Ingredients are required' }, 400);
    }
    
    // Call Gemini API for analysis
    const analysis = await analyzeIngredientsWithGemini(ingredients);
    
    // Store analysis in database if user is logged in
    let analysisId = null;
    if (userId) {
      const result = await env.DB.prepare(
        `INSERT INTO product_analyses 
         (userId, ingredients, analysis, overallRating, ingredientCount, createdAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      ).bind(
        userId,
        ingredients,
        JSON.stringify(analysis),
        analysis.overallRating,
        analysis.ingredients ? analysis.ingredients.length : 0
      ).run();
      
      analysisId = result.lastRowId;
    }
    
    // Add ID to response if available
    if (analysisId) {
      analysis.id = analysisId;
    }
    
    return jsonResponse(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return jsonResponse({ error: 'Failed to analyze product' }, 500);
  }
}

// Call Gemini API to analyze ingredients
async function analyzeIngredientsWithGemini(ingredients) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following product ingredients and provide a detailed health assessment. Focus on potential health impacts, allergens, irritants, and overall safety. 
                  
                  Ingredients: ${ingredients}
                  
                  Format your response as a JSON object with the following structure:
                  {
                    "overallRating": (number from 1-10, with 10 being safest),
                    "skinIrritationRating": (number from 1-10, with 10 being least irritating),
                    "allergenRating": (number from 1-10, with 10 being least allergenic),
                    "environmentalRating": (number from 1-10, with 10 being most eco-friendly),
                    "summary": "Brief summary of overall assessment",
                    "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3"],
                    "recommendation": "Overall recommendation on product usage",
                    "ingredients": [
                      {
                        "name": "Ingredient name",
                        "description": "Brief description of the ingredient",
                        "safetyRating": (number from 1-10, with 10 being safest),
                        "concerns": ["Potential concern 1", "Potential concern 2"]
                      },
                      // Repeat for each significant ingredient
                    ]
                  }
                  
                  Ensure your response is only the valid JSON object with no additional text.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      }
    );
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    // Extract JSON response from text
    const aiText = data.candidates[0].content.parts[0].text;
    
    // Try to parse the response as JSON
    let analysisData;
    try {
      if (aiText.includes('```json')) {
        const jsonStart = aiText.indexOf('```json') + 7;
        const jsonEnd = aiText.lastIndexOf('```');
        const jsonString = aiText.substring(jsonStart, jsonEnd).trim();
        analysisData = JSON.parse(jsonString);
      } else if (aiText.includes('```')) {
        const jsonStart = aiText.indexOf('```') + 3;
        const jsonEnd = aiText.lastIndexOf('```');
        const jsonString = aiText.substring(jsonStart, jsonEnd).trim();
        analysisData = JSON.parse(jsonString);
      } else {
        analysisData = JSON.parse(aiText);
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Failed to parse analysis result');
    }
    
    return analysisData;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Helper function to generate JWT token
function generateToken(userId) {
  // In a production environment, use a proper JWT library
  // This is a simplified example
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  }));
  
  const signature = btoa(
    hmacSha256(`${header}.${payload}`, env.JWT_SECRET)
  );
  
  return `${header}.${payload}.${signature}`;
}

// Helper function for HMAC-SHA256 (simplified)
function hmacSha256(data, key) {
  // In a production environment, use a proper crypto library
  // This is a placeholder for the example
  return hashString(data + key);
}

// Simple hash function (placeholder)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Authenticate user from request
async function authenticateUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Decode and verify token
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.sub;
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // Get user from database
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Create standardized JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Method not allowed response
function methodNotAllowed() {
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// Admin dashboard data
async function handleAdminDashboard(request) {
  try {
    // Verify admin user
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    // Get counts
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const analysisCount = await env.DB.prepare('SELECT COUNT(*) as count FROM product_analyses').first();
    const blogCount = await env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first();
    
    // Get recent users
    const recentUsers = await env.DB.prepare(
      `SELECT id, firstName, lastName, email, credits, createdAt 
       FROM users 
       ORDER BY createdAt DESC 
       LIMIT 10`
    ).all();
    
    // Get recent analyses
    const recentAnalyses = await env.DB.prepare(
      `SELECT pa.id, pa.ingredients, pa.overallRating, pa.createdAt, u.email as userEmail
       FROM product_analyses pa
       LEFT JOIN users u ON pa.userId = u.id
       ORDER BY pa.createdAt DESC
       LIMIT 10`
    ).all();
    
    return jsonResponse({
      stats: {
        userCount: userCount.count,
        analysisCount: analysisCount.count,
        blogCount: blogCount.count
      },
      recentUsers: recentUsers.results,
      recentAnalyses: recentAnalyses.results
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return jsonResponse({ error: 'Failed to get dashboard data' }, 500);
  }
}

// Admin users management
async function handleAdminUsers(request) {
  try {
    // Verify admin user
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    if (request.method === 'GET') {
      // Get all users
      const users = await env.DB.prepare(
        `SELECT id, firstName, lastName, email, country, gender, role, credits, createdAt, updatedAt, lastLogin
         FROM users
         ORDER BY createdAt DESC`
      ).all();
      
      return jsonResponse(users.results);
    }
    
    return methodNotAllowed();
  } catch (error) {
    console.error('Admin users error:', error);
    return jsonResponse({ error: 'Failed to manage users' }, 500);
  }
}

// Admin blog management
async function handleAdminBlog(request) {
  try {
    // Verify admin user
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    if (request.method === 'GET') {
      // Get all blog posts
      const posts = await env.DB.prepare(
        `SELECT * FROM blog_posts ORDER BY createdAt DESC`
      ).all();
      
      return jsonResponse(posts.results);
    }
    
    if (request.method === 'POST') {
      // Create new blog post
      const { title, excerpt, content, category, imageUrl, status } = await request.json();
      
      if (!title || !content) {
        return jsonResponse({ error: 'Title and content are required' }, 400);
      }
      
      const result = await env.DB.prepare(
        `INSERT INTO blog_posts 
         (title, excerpt, content, category, imageUrl, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        title,
        excerpt || '',
        content,
        category || 'General',
        imageUrl || '',
        status || 'draft'
      ).run();
      
      const newPost = await env.DB.prepare(
        `SELECT * FROM blog_posts WHERE id = ?`
      ).bind(result.lastRowId).first();
      
      return jsonResponse(newPost, 201);
    }
    
    return methodNotAllowed();
  } catch (error) {
    console.error('Admin blog error:', error);
    return jsonResponse({ error: 'Failed to manage blog posts' }, 500);
  }
}

// Admin specific blog post management
async function handleAdminBlogPost(request, endpoint) {
  try {
    // Verify admin user
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    const blogId = endpoint.split('/').pop();
    
    // Check if blog post exists
    const existingPost = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE id = ?`
    ).bind(blogId).first();
    
    if (!existingPost) {
      return jsonResponse({ error: 'Blog post not found' }, 404);
    }
    
    if (request.method === 'GET') {
      return jsonResponse(existingPost);
    }
    
    if (request.method === 'PUT') {
      const { title, excerpt, content, category, imageUrl, status } = await request.json();
      
      await env.DB.prepare(
        `UPDATE blog_posts 
         SET title = ?, excerpt = ?, content = ?, category = ?, imageUrl = ?, 
             status = ?, updatedAt = datetime('now')
         WHERE id = ?`
      ).bind(
        title || existingPost.title,
        excerpt !== undefined ? excerpt : existingPost.excerpt,
        content || existingPost.content,
        category || existingPost.category,
        imageUrl !== undefined ? imageUrl : existingPost.imageUrl,
        status || existingPost.status,
        blogId
      ).run();
      
      const updatedPost = await env.DB.prepare(
        `SELECT * FROM blog_posts WHERE id = ?`
      ).bind(blogId).first();
      
      return jsonResponse(updatedPost);
    }
    
    if (request.method === 'DELETE') {
      await env.DB.prepare(
        `DELETE FROM blog_posts WHERE id = ?`
      ).bind(blogId).run();
      
      return jsonResponse({ success: true });
    }
    
    return methodNotAllowed();
  } catch (error) {
    console.error('Admin blog post error:', error);
    return jsonResponse({ error: 'Failed to manage blog post' }, 500);
  }
}

// Handle admin ad settings
async function handleAdminAdSettings(request) {
  try {
    // Verify admin user
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    if (request.method === 'GET') {
      const settings = await env.DB.prepare(
        `SELECT * FROM app_settings WHERE key = 'ads'`
      ).first();
      
      if (!settings) {
        return jsonResponse({
          adCode: '',
          adTimerSeconds: 20,
          adEnabled: true,
          adPlacement: 'credits'
        });
      }
      
      return jsonResponse(JSON.parse(settings.value));
    }
    
    if (request.method === 'POST') {
      const { adCode, adTimerSeconds, adEnabled, adPlacement } = await request.json();
      
      const existingSettings = await env.DB.prepare(
        `SELECT * FROM app_settings WHERE key = 'ads'`
      ).first();
      
      const settingsValue = JSON.stringify({
        adCode: adCode || '',
        adTimerSeconds: adTimerSeconds || 20,
        adEnabled: adEnabled !== undefined ? adEnabled : true,
        adPlacement: adPlacement || 'credits'
      });
      
      if (!existingSettings) {
        await env.DB.prepare(
          `INSERT INTO app_settings (key, value, updatedAt)
           VALUES (?, ?, datetime('now'))`
        ).bind('ads', settingsValue).run();
      } else {
        await env.DB.prepare(
          `UPDATE app_settings
           SET value = ?, updatedAt = datetime('now')
           WHERE key = 'ads'`
        ).bind(settingsValue).run();
      }
      
      return jsonResponse({
        settings: JSON.parse(settingsValue)
      });
    }
    
    return methodNotAllowed();
  } catch (error) {
    console.error('Ad settings error:', error);
    return jsonResponse({ error: 'Failed to manage ad settings' }, 500);
  }
}

// Get ad settings for client
async function handleGetAdSettings(request) {
  try {
    if (request.method !== 'GET') {
      return methodNotAllowed();
    }
    
    const settings = await env.DB.prepare(
      `SELECT * FROM app_settings WHERE key = 'ads'`
    ).first();
    
    if (!settings) {
      return jsonResponse({
        adCode: '',
        adTimerSeconds: 20,
        adEnabled: true,
        adPlacement: 'credits'
      });
    }
    
    return jsonResponse(JSON.parse(settings.value));
  } catch (error) {
    console.error('Get ad settings error:', error);
    return jsonResponse({ error: 'Failed to get ad settings' }, 500);
  }
}

// Handle admin requests
async function handleAdminRequest(request, path) {
  // For the admin panel, serve static HTML
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HealthScan Admin</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 min-h-screen">
      <div id="admin-app"></div>
      <script>
        // Admin panel JS will be loaded here
        window.addEventListener('DOMContentLoaded', () => {
          // Initialize admin app
          const adminApp = document.getElementById('admin-app');
          
          // Check if user is logged in as admin
          fetch('/api/auth/me', {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data.error || data.role !== 'admin') {
              // Show login form
              showLoginForm();
            } else {
              // Show admin dashboard
              showAdminDashboard(data);
            }
          })
          .catch(err => {
            console.error('Auth error:', err);
            showLoginForm();
          });
          
          function showLoginForm() {
            adminApp.innerHTML = \`
              <div class="flex items-center justify-center min-h-screen">
                <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                  <h1 class="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                  <form id="admin-login-form">
                    <div class="mb-4">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                        Email
                      </label>
                      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" required>
                    </div>
                    <div class="mb-6">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Password
                      </label>
                      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password" required>
                    </div>
                    <div id="login-error" class="mb-4 text-red-500 text-sm hidden"></div>
                    <div class="flex items-center justify-between">
                      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
                        Sign In
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            \`;
            
            document.getElementById('admin-login-form').addEventListener('submit', function(e) {
              e.preventDefault();
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
              
              fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
              })
              .then(res => res.json())
              .then(data => {
                if (data.error) {
                  document.getElementById('login-error').textContent = data.error;
                  document.getElementById('login-error').classList.remove('hidden');
                  return;
                }
                
                if (data.user.role !== 'admin') {
                  document.getElementById('login-error').textContent = 'You are not authorized to access admin panel';
                  document.getElementById('login-error').classList.remove('hidden');
                  return;
                }
                
                localStorage.setItem('adminToken', data.token);
                showAdminDashboard(data.user);
              })
              .catch(err => {
                console.error('Login error:', err);
                document.getElementById('login-error').textContent = 'An error occurred during login';
                document.getElementById('login-error').classList.remove('hidden');
              });
            });
          }
          
          function showAdminDashboard(user) {
            // This would be expanded to show full dashboard functionality
            adminApp.innerHTML = \`
              <div class="min-h-screen">
                <nav class="bg-indigo-600 text-white shadow-lg">
                  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                      <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                          <span class="text-xl font-bold">HealthScan Admin</span>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <span class="mr-4">\${user.email}</span>
                        <button id="logout-btn" class="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded">
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </nav>
                
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div class="flex mb-6">
                    <button id="dashboard-tab" class="px-4 py-2 font-medium text-indigo-600 bg-white rounded-t-lg border-b-2 border-indigo-600">Dashboard</button>
                    <button id="users-tab" class="px-4 py-2 font-medium text-gray-600 hover:text-indigo-600">Users</button>
                    <button id="blog-tab" class="px-4 py-2 font-medium text-gray-600 hover:text-indigo-600">Blog Posts</button>
                    <button id="settings-tab" class="px-4 py-2 font-medium text-gray-600 hover:text-indigo-600">Settings</button>
                  </div>
                  
                  <div id="dashboard-content" class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-bold mb-6">Dashboard Overview</h2>
                    <div id="dashboard-loading" class="text-center py-4">
                      <p>Loading dashboard data...</p>
                    </div>
                  </div>
                </div>
              </div>
            \`;
            
            // Add event listeners for tabs
            document.getElementById('logout-btn').addEventListener('click', function() {
              localStorage.removeItem('adminToken');
              showLoginForm();
            });
            
            // Load dashboard data
            loadDashboardData();
            
            // Add tab event listeners
            document.getElementById('dashboard-tab').addEventListener('click', () => {
              selectTab('dashboard');
              loadDashboardData();
            });
            
            document.getElementById('users-tab').addEventListener('click', () => {
              selectTab('users');
              loadUsersData();
            });
            
            document.getElementById('blog-tab').addEventListener('click', () => {
              selectTab('blog');
              loadBlogData();
            });
            
            document.getElementById('settings-tab').addEventListener('click', () => {
              selectTab('settings');
              loadSettingsData();
            });
          }
          
          function selectTab(tabName) {
            // Reset all tabs
            ['dashboard', 'users', 'blog', 'settings'].forEach(tab => {
              document.getElementById(tab + '-tab').className = 'px-4 py-2 font-medium text-gray-600 hover:text-indigo-600';
            });
            
            // Highlight selected tab
            document.getElementById(tabName + '-tab').className = 'px-4 py-2 font-medium text-indigo-600 bg-white rounded-t-lg border-b-2 border-indigo-600';
          }
          
          function loadDashboardData() {
            const token = localStorage.getItem('adminToken');
            
            fetch('/api/admin/dashboard', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            })
            .then(res => res.json())
            .then(data => {
              if (data.error) {
                document.getElementById('dashboard-content').innerHTML = \`
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    \${data.error}
                  </div>
                \`;
                return;
              }
              
              document.getElementById('dashboard-content').innerHTML = \`
                <h2 class="text-xl font-bold mb-6">Dashboard Overview</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div class="bg-indigo-50 p-6 rounded-lg">
                    <h3 class="text-lg font-medium text-indigo-800">Total Users</h3>
                    <p class="text-3xl font-bold mt-2">\${data.stats.userCount}</p>
                  </div>
                  
                  <div class="bg-green-50 p-6 rounded-lg">
                    <h3 class="text-lg font-medium text-green-800">Total Analyses</h3>
                    <p class="text-3xl font-bold mt-2">\${data.stats.analysisCount}</p>
                  </div>
                  
                  <div class="bg-purple-50 p-6 rounded-lg">
                    <h3 class="text-lg font-medium text-purple-800">Blog Posts</h3>
                    <p class="text-3xl font-bold mt-2">\${data.stats.blogCount}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 class="text-lg font-medium mb-4">Recent Users</h3>
                    <div class="bg-white shadow overflow-hidden rounded-md">
                      <ul class="divide-y divide-gray-200">
                        \${data.recentUsers.map(user => \`
                          <li class="px-4 py-3">
                            <div class="flex items-center justify-between">
                              <div>
                                <p class="font-medium">\${user.firstName} \${user.lastName}</p>
                                <p class="text-sm text-gray-500">\${user.email}</p>
                              </div>
                              <span class="text-sm text-gray-500">\${new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </li>
                        \`).join('')}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 class="text-lg font-medium mb-4">Recent Analyses</h3>
                    <div class="bg-white shadow overflow-hidden rounded-md">
                      <ul class="divide-y divide-gray-200">
                        \${data.recentAnalyses.map(analysis => \`
                          <li class="px-4 py-3">
                            <div class="flex items-center justify-between">
                              <div>
                                <p class="font-medium">Analysis #\${analysis.id}</p>
                                <p class="text-sm text-gray-500">\${analysis.userEmail || 'Anonymous'}</p>
                              </div>
                              <div class="text-right">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                                  analysis.overallRating >= 7 ? 'bg-green-100 text-green-800' :
                                  analysis.overallRating >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }">
                                  \${analysis.overallRating}/10
                                </span>
                                <p class="text-xs text-gray-500 mt-1">\${new Date(analysis.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </li>
                        \`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>
              \`;
            })
            .catch(err => {
              console.error('Dashboard error:', err);
              document.getElementById('dashboard-content').innerHTML = \`
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  Failed to load dashboard data
                </div>
              \`;
            });
          }
          
          function loadUsersData() {
            // This would be implemented to load and display users
            document.getElementById('dashboard-content').innerHTML = \`
              <h2 class="text-xl font-bold mb-6">User Management</h2>
              <div id="users-loading" class="text-center py-4">
                <p>Loading users data...</p>
              </div>
            \`;
            
            // Implementation would continue here...
          }
          
          function loadBlogData() {
            // This would be implemented to load and display blog posts
            document.getElementById('dashboard-content').innerHTML = \`
              <h2 class="text-xl font-bold mb-6">Blog Management</h2>
              <div id="blog-loading" class="text-center py-4">
                <p>Loading blog data...</p>
              </div>
            \`;
            
            // Implementation would continue here...
          }
          
          function loadSettingsData() {
            // This would be implemented to load and display settings
            document.getElementById('dashboard-content').innerHTML = \`
              <h2 class="text-xl font-bold mb-6">Settings</h2>
              <div id="settings-loading" class="text-center py-4">
                <p>Loading settings data...</p>
              </div>
            \`;
            
            // Implementation would continue here...
          }
        });
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}