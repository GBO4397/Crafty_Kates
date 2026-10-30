<main class="ckp-login-card">
    <p class="ckp-eyebrow">Protected Management</p>
    <h1>Crafty Kates Admin</h1>
    <p>Manage website media, sponsors, event submissions, registrations, check-in, planning, archives, and portal users.</p>
    <?php if (!empty($error)): ?><div class="ckp-alert ckp-alert--error"><?php echo esc_html($error); ?></div><?php endif; ?>
    <?php if (!empty($setup_available)): ?>
        <details class="ckp-setup">
            <summary>Create the first Portal Owner</summary>
            <p>This one-time setup is available only while no portal accounts exist.</p>
            <form action="<?php echo esc_url(home_url('/ck-portal/setup')); ?>" method="post">
                <label>Setup key<input type="password" name="setup_key" required autocomplete="off"></label>
                <label>Name<input type="text" name="display_name" required autocomplete="name"></label>
                <label>Email<input type="email" name="email" required autocomplete="email"></label>
                <label>Password<input type="password" name="password" required minlength="12" autocomplete="new-password"></label>
                <button type="submit" class="ckp-button ckp-button--primary">Create Portal Owner</button>
            </form>
        </details>
    <?php else: ?>
        <form action="<?php echo esc_url(home_url('/ck-portal/login')); ?>" method="post">
            <label>Email<input type="email" name="email" required autocomplete="username"></label>
            <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
            <button type="submit" class="ckp-button ckp-button--primary">Sign In</button>
        </form>
    <?php endif; ?>
    <a href="<?php echo esc_url(home_url('/')); ?>">&larr; Return to the public site</a>
</main>
