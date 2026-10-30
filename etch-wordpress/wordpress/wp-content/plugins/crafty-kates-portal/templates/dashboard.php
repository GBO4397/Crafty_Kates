<div class="ckp-app" data-ck-portal>
    <aside class="ckp-sidebar">
        <div class="ckp-brand"><span>CK</span><div><strong>Admin Panel</strong><small>Crafty Kates</small></div></div>
        <nav aria-label="Admin tools" data-ck-nav></nav>
        <div class="ckp-sidebar__footer">
            <a href="<?php echo esc_url(home_url('/')); ?>">Back to Site</a>
            <form action="<?php echo esc_url(home_url('/ck-portal/logout')); ?>" method="post">
                <input type="hidden" name="_ck_csrf" value="<?php echo esc_attr((string) $session['csrf_token']); ?>">
                <button type="submit">Sign Out</button>
            </form>
        </div>
    </aside>
    <main class="ckp-main">
        <header class="ckp-topbar"><button class="ckp-menu" type="button" data-ck-menu aria-label="Open menu">&#9776;</button><div><h1 data-ck-title>Admin Dashboard</h1><p data-ck-subtitle>Select a tool to get started</p></div><div class="ckp-user"><strong><?php echo esc_html((string) $session['display_name']); ?></strong><small><?php echo esc_html((string) $session['email']); ?></small></div></header>
        <?php if (!empty($password_error)): ?><div class="ckp-alert ckp-alert--error"><?php echo esc_html($password_error); ?></div><?php endif; ?>
        <?php if (!empty($session['must_change_password'])): ?>
            <section class="ckp-panel ckp-password-change"><h2>Change your password</h2><p>Your account requires a new password before regular portal work continues.</p><form action="<?php echo esc_url(home_url('/ck-portal/change-password')); ?>" method="post"><input type="hidden" name="_ck_csrf" value="<?php echo esc_attr((string) $session['csrf_token']); ?>"><label>Current password<input type="password" name="current_password" required autocomplete="current-password"></label><label>New password<input type="password" name="new_password" required minlength="12" autocomplete="new-password"></label><button class="ckp-button ckp-button--primary">Save New Password</button></form></section>
        <?php else: ?>
            <div class="ckp-loading" data-ck-loading>Loading portal&hellip;</div>
            <section class="ckp-content" data-ck-content hidden></section>
        <?php endif; ?>
    </main>
</div>
