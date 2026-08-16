(() => {
  'use strict';

  const root = document.querySelector('[data-ck-portal]');
  if (!root || !window.CKPortalBoot) return;

  const content = root.querySelector('[data-ck-content]');
  const loading = root.querySelector('[data-ck-loading]');
  const nav = root.querySelector('[data-ck-nav]');
  const title = root.querySelector('[data-ck-title]');
  const subtitle = root.querySelector('[data-ck-subtitle]');
  const state = { config: null, active: 'dashboard', cache: {} };

  const tools = [
    ['images', 'Image Manager', 'Upload & manage site images', 'images.manage'],
    ['sponsors', 'Sponsor Admin', 'Manage sponsors & logos', 'sponsors.manage'],
    ['events', 'Event Admin', 'Review community submissions', 'events.manage'],
    ['registrations', 'Registrations', 'Car show registration entries', 'registrations.view'],
    ['checkin', 'Check-In', 'Day-of event check-in system', 'checkin.manage'],
    ['checklist', 'Organizer Checklist', 'Car show planning tasks', 'checklist.manage'],
    ['archive', 'Download Site Images', 'Archive public media', 'archive.download'],
    ['users', 'User Admin', 'Manage portal users & access', 'users.manage'],
  ];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const can = capability => state.config.user.capabilities.includes(capability);
  const formValue = (form, name) => form.elements[name]?.value?.trim() ?? '';
  const checked = (form, name) => Boolean(form.elements[name]?.checked);

  async function api(path, options = {}) {
    const request = { credentials: 'same-origin', ...options, headers: { ...(options.headers || {}) } };
    if (request.body && !(request.body instanceof FormData)) request.headers['Content-Type'] = 'application/json';
    if (request.method && request.method !== 'GET') request.headers['X-CK-CSRF'] = state.config.csrf;
    const response = await fetch(`${CKPortalBoot.apiRoot}${path}`, request);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
    return data;
  }

  function notice(message, type = 'success') {
    const node = document.createElement('div');
    node.className = `ckp-toast ckp-toast--${type}`;
    node.textContent = message;
    document.body.append(node);
    setTimeout(() => node.remove(), 4000);
  }

  function setView(viewTitle, viewSubtitle, html) {
    title.textContent = viewTitle;
    subtitle.textContent = viewSubtitle;
    content.innerHTML = html;
    content.hidden = false;
    loading.hidden = true;
    root.classList.remove('is-menu-open');
  }

  function renderNav() {
    nav.innerHTML = `<button data-tool="dashboard" class="is-active"><span>Dashboard</span><small>All tools</small></button>` + tools
      .filter(([, , , capability]) => can(capability))
      .map(([key, label, description]) => `<button data-tool="${key}"><span>${esc(label)}</span><small>${esc(description)}</small></button>`).join('');
    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-tool]');
      if (!button) return;
      openTool(button.dataset.tool);
    });
  }

  async function openTool(key) {
    state.active = key;
    nav.querySelectorAll('[data-tool]').forEach(button => button.classList.toggle('is-active', button.dataset.tool === key));
    loading.hidden = false;
    content.hidden = true;
    const renderer = renderers[key] || renderDashboard;
    try { await renderer(); } catch (error) { setView('Something went wrong', 'The tool could not load', `<div class="ckp-alert ckp-alert--error">${esc(error.message)}</div>`); }
  }

  function renderDashboard() {
    const cards = tools.filter(([, , , capability]) => can(capability)).map(([key, label, description]) => `
      <button class="ckp-tool-card" data-open-tool="${key}"><span class="ckp-tool-card__icon">${esc(label.charAt(0))}</span><strong>${esc(label)}</strong><small>${esc(description)}</small><i>›</i></button>`).join('');
    setView('Admin Dashboard', 'Select a tool to get started', `<div class="ckp-intro"><h2>What would you like to work on?</h2><p>Select an admin tool below. Your account only shows tools you are allowed to use.</p></div><div class="ckp-tool-grid">${cards}</div>`);
    content.querySelectorAll('[data-open-tool]').forEach(button => button.addEventListener('click', () => openTool(button.dataset.openTool)));
  }

  async function renderImages() {
    const [images, galleries] = await Promise.all([api('/images'), api('/galleries')]);
    const slots = Object.entries(images.items).map(([key, item]) => `
      <article class="ckp-media-card"><div class="ckp-media-card__preview">${item.url ? `<img src="${esc(item.url)}" alt="${esc(item.alt || item.label)}">` : '<span>No image</span>'}</div>
      <div><span class="ckp-badge">${esc(item.category)}</span><h3>${esc(item.label)}</h3><p>${esc(item.description)}</p><code>${esc(key)}</code></div>
      <div class="ckp-actions"><label class="ckp-button ckp-button--primary">${item.url ? 'Replace' : 'Upload'}<input type="file" accept="image/*" data-image-upload="${esc(key)}" hidden></label>${item.url ? `<button class="ckp-button ckp-button--danger" data-image-remove="${esc(key)}">Remove</button>` : ''}</div></article>`).join('');
    const galleryCards = galleries.items.map(gallery => `<article class="ckp-panel"><h3>${esc(gallery.name)}</h3><p>${gallery.count} uploaded photo${gallery.count === 1 ? '' : 's'}</p><label class="ckp-button ckp-button--primary">Add Photo<input type="file" accept="image/*" data-gallery-upload="${gallery.id}" hidden></label></article>`).join('');
    setView('Image Manager', 'Upload & manage site images', `<div class="ckp-stats"><div><strong>${Object.values(images.items).filter(item => item.url).length}</strong><span>of ${Object.keys(images.items).length} site images</span></div><div><strong>${galleries.items.reduce((total, item) => total + item.count, 0)}</strong><span>gallery uploads</span></div></div><div class="ckp-media-list">${slots}</div><h2>Photo Galleries</h2><div class="ckp-grid ckp-grid--2">${galleryCards}</div>`);
    content.querySelectorAll('[data-image-upload]').forEach(input => input.addEventListener('change', async () => uploadFile(`/images/${input.dataset.imageUpload}`, input)));
    content.querySelectorAll('[data-gallery-upload]').forEach(input => input.addEventListener('change', async () => uploadFile(`/galleries/${input.dataset.galleryUpload}/media`, input)));
    content.querySelectorAll('[data-image-remove]').forEach(button => button.addEventListener('click', async () => {
      if (!confirm('Remove this image from the website slot? The Media Library file will be retained.')) return;
      await api(`/images/${button.dataset.imageRemove}`, { method: 'DELETE' }); notice('Image removed.'); renderImages();
    }));
  }

  async function uploadFile(path, input) {
    if (!input.files?.[0]) return;
    const body = new FormData(); body.append('file', input.files[0]);
    try { await api(path, { method: 'POST', body }); notice('Image uploaded.'); renderImages(); } catch (error) { notice(error.message, 'error'); }
  }

  function sponsorFields(item = {}) {
    const tiers = ['gold', 'silver', 'bronze'].map(tier => `<option value="${tier}" ${item.tier === tier ? 'selected' : ''}>${tier[0].toUpperCase() + tier.slice(1)}</option>`).join('');
    return `<input type="hidden" name="id" value="${item.id || ''}"><div class="ckp-form-grid"><label>Sponsor Name<input name="name" required value="${esc(item.name)}"></label><label>Tier<select name="tier">${tiers}</select></label></div><label>Description<textarea name="description" rows="3">${esc(item.description)}</textarea></label><div class="ckp-form-grid"><label>Website<input type="url" name="website_url" value="${esc(item.website_url)}"></label><label>Display Order<input type="number" name="sort_order" min="0" value="${Number(item.sort_order || 0)}"></label></div><div class="ckp-form-grid"><label>Facebook<input type="url" name="facebook_url" value="${esc(item.facebook_url)}"></label><label>Instagram<input type="url" name="instagram_url" value="${esc(item.instagram_url)}"></label><label>YouTube<input type="url" name="youtube_url" value="${esc(item.youtube_url)}"></label><label>TikTok<input type="url" name="tiktok_url" value="${esc(item.tiktok_url)}"></label></div>${item.id ? `<label>Sponsor Logo<input type="file" name="logo_file" accept="image/jpeg,image/png,image/webp,image/svg+xml"><small>${item.logo_url ? 'Uploading a file replaces the current logo.' : 'Add the sponsor logo after saving.'}</small></label>` : '<p class="ckp-help">Save the sponsor first, then edit it to upload a logo.</p>'}<label class="ckp-check"><input type="checkbox" name="is_active" ${item.is_active !== false ? 'checked' : ''}> Active</label><button class="ckp-button ckp-button--primary" type="submit">${item.id ? 'Save Sponsor' : 'Add Sponsor'}</button>`;
  }

  async function renderSponsors() {
    const data = await api('/sponsors'); state.cache.sponsors = data.items;
    const cards = data.items.map(item => `<article class="ckp-sponsor-card ${item.is_active ? '' : 'is-inactive'}">${item.logo_url ? `<img src="${esc(item.logo_url)}" alt="">` : '<div class="ckp-logo-placeholder">No logo</div>'}<span class="ckp-badge ckp-badge--${esc(item.tier)}">${esc(item.tier)}</span><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><small>Order ${item.sort_order} · ${item.is_active ? 'Active' : 'Inactive'}</small><button class="ckp-button" data-edit-sponsor="${item.id}">Edit</button></article>`).join('');
    setView('Sponsor Admin', 'Manage sponsors & logos', `<div class="ckp-heading-row"><div><h2>Sponsor Dashboard</h2><p>${data.items.length} sponsors across Gold, Silver, and Bronze tiers.</p></div><button class="ckp-button ckp-button--primary" data-add-sponsor>Add Sponsor</button></div><div class="ckp-grid ckp-grid--3">${cards}</div><dialog class="ckp-dialog" data-sponsor-dialog><form method="dialog" class="ckp-dialog__close"><button aria-label="Close">×</button></form><h2 data-sponsor-dialog-title>Add Sponsor</h2><form data-sponsor-form>${sponsorFields()}</form></dialog>`);
    const dialog = content.querySelector('[data-sponsor-dialog]');
    const form = content.querySelector('[data-sponsor-form]');
    content.querySelector('[data-add-sponsor]').addEventListener('click', () => { form.innerHTML = sponsorFields(); dialog.showModal(); bindSponsorForm(form, dialog); });
    content.querySelectorAll('[data-edit-sponsor]').forEach(button => button.addEventListener('click', () => { const item = data.items.find(row => row.id === Number(button.dataset.editSponsor)); form.innerHTML = sponsorFields(item); dialog.showModal(); bindSponsorForm(form, dialog); }));
    bindSponsorForm(form, dialog);
  }

  function bindSponsorForm(form, dialog) {
    form.onsubmit = async event => {
      event.preventDefault(); const id = Number(formValue(form, 'id'));
      const payload = Object.fromEntries(new FormData(form)); payload.sort_order = Number(payload.sort_order || 0); payload.is_active = checked(form, 'is_active');
      await api(id ? `/sponsors/${id}` : '/sponsors', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      const logo = form.elements.logo_file;
      if (id && logo?.files?.[0]) {
        const body = new FormData(); body.append('file', logo.files[0]);
        await api(`/sponsors/${id}/logo`, { method: 'POST', body });
      }
      dialog.close(); notice(id ? 'Sponsor updated.' : 'Sponsor added.'); renderSponsors();
    };
  }

  async function renderEvents() {
    const data = await api('/events');
    const cards = data.items.map(item => `<article class="ckp-event-card"><div class="ckp-heading-row"><div><span class="ckp-badge">${esc(item.review_status || 'pending')}</span><h3>${esc(item.title)}</h3></div><time>${esc(item.event_date || 'Date not supplied')}</time></div><p>${esc(item.description)}</p><dl><div><dt>Location</dt><dd>${esc(item.location)}${item.address ? `<br>${esc(item.address)}` : ''}</dd></div><div><dt>Organizer</dt><dd>${esc(item.organizer_name)}<br>${esc(item.organizer_email)} · ${esc(item.organizer_phone)}</dd></div></dl><label>Admin Notes<textarea data-event-notes="${item.id}" rows="2">${esc(item.admin_notes)}</textarea></label><div class="ckp-actions"><button class="ckp-button ckp-button--primary" data-event-action="approve" data-id="${item.id}">Approve</button><button class="ckp-button" data-event-action="reject" data-id="${item.id}">Reject</button><button class="ckp-button ckp-button--danger" data-event-action="delete" data-id="${item.id}">Delete</button></div></article>`).join('');
    setView('Event Admin', 'Review community submissions', `<div class="ckp-stats"><div><strong>${data.items.filter(item => item.review_status === 'pending').length}</strong><span>Pending</span></div><div><strong>${data.items.filter(item => item.review_status === 'approved').length}</strong><span>Approved</span></div><div><strong>${data.items.filter(item => item.review_status === 'rejected').length}</strong><span>Rejected</span></div></div><div class="ckp-stack">${cards || '<div class="ckp-empty">No event submissions.</div>'}</div>`);
    content.querySelectorAll('[data-event-action]').forEach(button => button.addEventListener('click', async () => {
      if (button.dataset.eventAction === 'delete' && !confirm('Move this event to the trash?')) return;
      const notes = content.querySelector(`[data-event-notes="${button.dataset.id}"]`).value;
      await api(`/events/${button.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ action: button.dataset.eventAction, admin_notes: notes }) });
      notice('Event updated.'); renderEvents();
    }));
  }

  function registrationFilters(items, search, type, stateFilter) {
    const needle = search.toLowerCase();
    return items.filter(item => (!needle || [item.name, item.email, item.phone, item.city, item.vehicle_year, item.vehicle_make, item.vehicle_model].join(' ').toLowerCase().includes(needle)) && (type === 'all' || item.entry_type === type) && (stateFilter === 'all' || (stateFilter === 'checked') === item.checked_in));
  }

  async function loadRegistrations(path = '/registrations') {
    if (!state.cache.registrations) state.cache.registrations = (await api(path)).items;
    return state.cache.registrations;
  }

  async function renderRegistrations() {
    const items = await loadRegistrations();
    setView('Registrations', 'Car show registration entries', `<div class="ckp-stats"><div><strong>${items.length}</strong><span>Total</span></div><div><strong>${items.filter(item => item.entry_type === 'vehicle').length}</strong><span>Vehicles</span></div><div><strong>${items.filter(item => item.entry_type === 'vendor').length}</strong><span>Vendors</span></div><div><strong>${items.filter(item => item.entry_type === 'cackle').length}</strong><span>Cackle Cars</span></div></div><div class="ckp-filters"><input type="search" placeholder="Search name, email, phone, city, vehicle…" data-reg-search><select data-reg-type><option value="all">All Types</option><option value="vehicle">Vehicles</option><option value="vendor">Vendors</option><option value="cackle">Cackle Cars</option></select>${can('registrations.export') ? '<button class="ckp-button" data-reg-export>Export CSV</button>' : ''}</div><div data-reg-list></div>`);
    const draw = () => {
      const rows = registrationFilters(items, content.querySelector('[data-reg-search]').value, content.querySelector('[data-reg-type]').value, 'all');
      content.querySelector('[data-reg-list]').innerHTML = `<p>${rows.length} registration${rows.length === 1 ? '' : 's'}</p><div class="ckp-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Entry</th><th>Date</th></tr></thead><tbody>${rows.map(registrationRow).join('')}</tbody></table></div>`;
    };
    content.querySelector('[data-reg-search]').addEventListener('input', draw); content.querySelector('[data-reg-type]').addEventListener('change', draw); draw();
    content.querySelector('[data-reg-export]')?.addEventListener('click', () => exportRegistrations(items));
  }

  function registrationRow(item) {
    const entry = item.entry_type === 'vehicle' ? `${item.vehicle_year || ''} ${item.vehicle_make || ''} ${item.vehicle_model || ''}` : item.entry_type === 'vendor' ? `${item.vendor_name || ''} ${item.vendor_space_size || ''}` : item.cackle_car_info || '';
    return `<tr><td><details><summary><strong>${esc(item.name)}</strong></summary><div class="ckp-record-detail"><a href="mailto:${esc(item.email)}">${esc(item.email)}</a><br><a href="tel:${esc(item.phone)}">${esc(item.phone)}</a><p>${esc(item.address)}<br>${esc(item.city)}, ${esc(item.state)} ${esc(item.postal_code)}</p><p>Liability: ${item.liability_agreed ? 'Agreed' : 'Missing'} · Photo: ${item.photo_release ? 'Agreed' : 'Missing'}</p></div></details></td><td>${esc(item.entry_type)}</td><td>${esc(entry.trim())}</td><td>${esc(item.created_at)}</td></tr>`;
  }

  function exportRegistrations(items) {
    const keys = ['name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'entry_type', 'vehicle_year', 'vehicle_make', 'vehicle_model', 'vendor_name', 'vendor_space_size', 'cackle_car_info', 'payment_status', 'checked_in_at', 'created_at'];
    const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [keys.join(','), ...items.map(item => keys.map(key => quote(item[key])).join(','))].join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `crafty-kates-registrations-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }

  async function renderCheckin() {
    const items = await loadRegistrations('/checkin');
    const checkedCount = items.filter(item => item.checked_in).length;
    setView('Day-of Check-In', 'Mark registrants as checked-in and track payments', `<div class="ckp-progress"><strong>${checkedCount} of ${items.length} Checked In</strong><div><span style="width:${items.length ? Math.round(checkedCount / items.length * 100) : 0}%"></span></div><p>${items.length - checkedCount} remaining · ${items.filter(item => item.payment_status === 'paid').length} paid · ${items.filter(item => item.payment_status === 'unpaid').length} unpaid</p></div><div class="ckp-filters"><input type="search" placeholder="Search name, email, phone, vehicle…" data-check-search><select data-check-state><option value="all">All</option><option value="unchecked">Not Checked In</option><option value="checked">Checked In</option></select></div><div class="ckp-checkin-list" data-check-list></div>`);
    const draw = () => {
      const filter = content.querySelector('[data-check-state]').value;
      const rows = registrationFilters(items, content.querySelector('[data-check-search]').value, 'all', filter === 'unchecked' ? 'not-checked' : filter);
      content.querySelector('[data-check-list]').innerHTML = rows.map(item => `<article class="${item.checked_in ? 'is-checked' : ''}"><div><span class="ckp-badge">${esc(item.entry_type)}</span><h3>${esc(item.name)}</h3><p>${esc(item.email)} · ${esc(item.phone)}</p></div><div class="ckp-actions"><button class="ckp-button" data-payment="${item.id}">${esc(item.payment_status)}</button><button class="ckp-button ${item.checked_in ? '' : 'ckp-button--primary'}" data-checkin="${item.id}">${item.checked_in ? 'Undo Check-In' : 'Check In'}</button></div></article>`).join('');
      bindCheckin(rows);
    };
    content.querySelector('[data-check-search]').addEventListener('input', draw); content.querySelector('[data-check-state]').addEventListener('change', draw); draw();
  }

  function bindCheckin(rows) {
    content.querySelectorAll('[data-checkin]').forEach(button => button.addEventListener('click', async () => { const item = rows.find(row => row.id === Number(button.dataset.checkin)); const updated = await api(`/registrations/${item.id}`, { method: 'PATCH', body: JSON.stringify({ checked_in: !item.checked_in }) }); Object.assign(item, updated); state.cache.registrations = state.cache.registrations.map(row => row.id === item.id ? item : row); renderCheckin(); }));
    content.querySelectorAll('[data-payment]').forEach(button => button.addEventListener('click', async () => { const item = rows.find(row => row.id === Number(button.dataset.payment)); const next = item.payment_status === 'unpaid' ? 'paid' : item.payment_status === 'paid' ? 'waived' : 'unpaid'; const updated = await api(`/registrations/${item.id}`, { method: 'PATCH', body: JSON.stringify({ payment_status: next }) }); Object.assign(item, updated); state.cache.registrations = state.cache.registrations.map(row => row.id === item.id ? item : row); renderCheckin(); }));
  }

  function renderChecklist() {
    const saved = JSON.parse(localStorage.getItem('ck-organizer-checklist') || '{}');
    const total = state.config.checklist.reduce((sum, section) => sum + section.tasks.length, 0);
    const sections = state.config.checklist.map(section => `<section class="ckp-checklist-section"><div><span>${esc(section.label)}</span><h2>${esc(section.title)}</h2></div>${section.tasks.map((task, index) => { const key = `${section.key}:${index}`; return `<label><input type="checkbox" data-task="${esc(key)}" ${saved[key] ? 'checked' : ''}><span>${esc(task)}</span></label>`; }).join('')}</section>`).join('');
    const completed = Object.values(saved).filter(Boolean).length;
    setView('Organizer Checklist', 'Progress saves in this browser on this device', `<div class="ckp-stats"><div><strong data-checklist-completed>${completed}</strong><span>Completed</span></div><div><strong data-checklist-remaining>${total - completed}</strong><span>Remaining</span></div><div><strong>${total}</strong><span>Total Tasks</span></div></div><div class="ckp-actions"><button class="ckp-button" data-print>Print Checklist</button><button class="ckp-button ckp-button--danger" data-clear>Clear All Checks</button></div><div class="ckp-checklist">${sections}</div>`);
    const update = () => { const value = {}; content.querySelectorAll('[data-task]').forEach(box => value[box.dataset.task] = box.checked); localStorage.setItem('ck-organizer-checklist', JSON.stringify(value)); const count = Object.values(value).filter(Boolean).length; content.querySelector('[data-checklist-completed]').textContent = count; content.querySelector('[data-checklist-remaining]').textContent = total - count; };
    content.querySelectorAll('[data-task]').forEach(box => box.addEventListener('change', update)); content.querySelector('[data-print]').addEventListener('click', () => window.print()); content.querySelector('[data-clear]').addEventListener('click', () => { if (confirm('Clear every checkmark on this device?')) { content.querySelectorAll('[data-task]').forEach(box => box.checked = false); update(); } });
  }

  function renderArchive() {
    setView('Download Site Images', 'Archive public WordPress and Etch media', `<section class="ckp-panel ckp-panel--narrow"><h2>Download Public Media ZIP</h2><p>The archive includes site images, sponsor logos, gallery photos, and coloring-book media currently managed by WordPress and Etch.</p><p>It includes a CSV manifest with WordPress attachment IDs, source URLs, and SHA-256 hashes. Portal accounts, registrations, contacts, and private migration data are never included.</p><a class="ckp-button ckp-button--primary" href="${esc(CKPortalBoot.adminUrl)}/download-images">Download ZIP</a></section>`);
  }

  function userFields(item = {}) {
    const initialRole = item.role_key || 'site_manager';
    const selectedCapabilities = item.capabilities || state.config.roles[initialRole]?.capabilities || [];
    const roles = Object.entries(state.config.roles).map(([key, role]) => `<option value="${esc(key)}" ${initialRole === key ? 'selected' : ''}>${esc(role.label)}</option>`).join('');
    const caps = Object.entries(state.config.capability_labels).map(([key, label]) => `<label class="ckp-check"><input type="checkbox" name="capabilities" value="${esc(key)}" ${selectedCapabilities.includes(key) ? 'checked' : ''}> ${esc(label)}</label>`).join('');
    return `<input type="hidden" name="id" value="${item.id || ''}"><div class="ckp-form-grid"><label>Name<input name="display_name" required value="${esc(item.display_name)}"></label>${item.id ? `<label>Email<input value="${esc(item.email)}" disabled></label>` : `<label>Email<input type="email" name="email" required value="${esc(item.email)}"></label>`}<label>Role<select name="role_key">${roles}</select></label><label>Status<select name="status"><option value="active" ${item.status !== 'inactive' ? 'selected' : ''}>Active</option><option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></label></div><label>${item.id ? 'New password (leave blank to keep current)' : 'Temporary password'}<input type="password" name="password" ${item.id ? '' : 'required'} minlength="12" autocomplete="new-password"></label><fieldset><legend>Tool Permissions</legend><div class="ckp-cap-grid">${caps}</div></fieldset><label class="ckp-check"><input type="checkbox" name="must_change_password" ${item.must_change_password ? 'checked' : ''}> Require password change</label>${item.id ? '<label class="ckp-check"><input type="checkbox" name="revoke_sessions"> Revoke all active sessions</label>' : ''}<button class="ckp-button ckp-button--primary" type="submit">${item.id ? 'Save User' : 'Add User'}</button>`;
  }

  async function renderUsers() {
    const data = await api('/users'); state.cache.users = data.items;
    const rows = data.items.map(item => `<tr><td><strong>${esc(item.display_name)}</strong><br><small>${esc(item.email)}</small></td><td>${esc(state.config.roles[item.role_key]?.label || item.role_key)}</td><td><span class="ckp-badge">${esc(item.status)}</span></td><td>${esc(item.last_login_at || 'Never')}</td><td><button class="ckp-button" data-edit-user="${item.id}">Edit</button></td></tr>`).join('');
    setView('User Admin', 'Manage independent Crafty Kates portal accounts', `<div class="ckp-heading-row"><div><h2>Portal Users</h2><p>These accounts are separate from WordPress users and WordPress Admin.</p></div><button class="ckp-button ckp-button--primary" data-add-user>Add User</button></div><div class="ckp-table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><dialog class="ckp-dialog" data-user-dialog><form method="dialog" class="ckp-dialog__close"><button aria-label="Close">×</button></form><h2>User Account</h2><form data-user-form>${userFields()}</form></dialog>`);
    const dialog = content.querySelector('[data-user-dialog]'); const form = content.querySelector('[data-user-form]');
    const bind = () => {
      const role = form.elements.role_key;
      role.onchange = () => {
        const defaults = state.config.roles[role.value]?.capabilities || [];
        form.querySelectorAll('[name="capabilities"]').forEach(box => box.checked = defaults.includes(box.value));
      };
      form.onsubmit = async event => { event.preventDefault(); const id = Number(formValue(form, 'id')); const payload = Object.fromEntries(new FormData(form)); payload.capabilities = [...form.querySelectorAll('[name="capabilities"]:checked')].map(box => box.value); payload.must_change_password = checked(form, 'must_change_password'); payload.revoke_sessions = checked(form, 'revoke_sessions'); await api(id ? `/users/${id}` : '/users', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); dialog.close(); notice(id ? 'User updated.' : 'User created.'); renderUsers(); };
    };
    content.querySelector('[data-add-user]').addEventListener('click', () => { form.innerHTML = userFields(); dialog.showModal(); bind(); });
    content.querySelectorAll('[data-edit-user]').forEach(button => button.addEventListener('click', () => { const item = data.items.find(row => row.id === Number(button.dataset.editUser)); form.innerHTML = userFields(item); dialog.showModal(); bind(); })); bind();
  }

  const renderers = { dashboard: renderDashboard, images: renderImages, sponsors: renderSponsors, events: renderEvents, registrations: renderRegistrations, checkin: renderCheckin, checklist: renderChecklist, archive: renderArchive, users: renderUsers };

  async function boot() {
    try {
      const response = await fetch(`${CKPortalBoot.apiRoot}/config`, { credentials: 'same-origin' });
      if (response.status === 401) { window.location.reload(); return; }
      state.config = await response.json();
      renderNav(); renderDashboard();
      root.querySelector('[data-ck-menu]').addEventListener('click', () => root.classList.toggle('is-menu-open'));
    } catch (error) {
      loading.textContent = error.message || 'The portal could not load.';
    }
  }

  boot();
})();
