function renderLoginPage() {
  if (Auth.isLoggedIn()) { Router.go('/admin'); return; }

  document.getElementById('app').innerHTML = `
    <div class="login-page">
      <div class="login-card reveal-scale">
        <h1 class="serif">Staff Login</h1>
        <p>Sign in to access the Dar Al-Qahwa dashboard.</p>
        <form class="login-form" id="login-form" onsubmit="submitLogin(event)">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="l-email" placeholder="admin@daralqahwa.jo" required autocomplete="email" value="admin@daralqahwa.jo"/>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="l-password" placeholder="••••••••" required autocomplete="current-password" value="admin123"/>
          </div>
          <div id="login-error" class="form-error" style="display:none"></div>
          <button type="submit" class="btn-primary w-full" id="login-btn">Sign In</button>
        </form>
        <p style="text-align:center;margin-top:1.25rem;font-size:0.78rem;color:var(--text-sec)">
          Default: admin@daralqahwa.jo / admin123
        </p>
      </div>
    </div>
  `;
  initPageAnimations();
}

async function submitLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const { token, user } = await api.login(
      document.getElementById('l-email').value,
      document.getElementById('l-password').value
    );
    Auth.login(token, user);
    Toast.show(`Welcome back, ${user.name}!`, 'success');
    Router.go('/admin');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}
