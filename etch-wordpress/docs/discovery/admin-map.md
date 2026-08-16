# Admin behavior map

## Unified dashboard

The dashboard contains eight tools:

1. Image Manager
2. Sponsor Admin
3. Event Admin
4. Registrations
5. Check-In
6. Organizer Checklist
7. Download Site Images
8. User Admin

## Image Manager

- Lists image slots by category and display order.
- Uploads or replaces an image for a slot.
- Preserves the eleven fixed site-image slots recovered from the live application.
- Includes the photographer-gallery upload views.

## Sponsor Admin

- Creates and edits sponsors.
- Supports gold, silver, and bronze tiers.
- Uploads/replaces logos.
- Edits website and social links.
- Enables/disables sponsors.
- Displays sponsors by tier and saves `sort_order` and active state.

## Event Admin

- Lists pending, approved, and rejected submissions.
- Views submitted event details and flyer.
- Approves or rejects events with admin notes.
- Sets review/update timestamps.
- Deletes an event.

## Registrations

- Read-only registration management view.
- Summary cards: total, vehicles, vendors, cackle cars, and registrations from the last seven days.
- Search by name, email, phone, city, or vehicle.
- Filter by entry type.
- Paginated list with full detail overlay.
- CSV export of the current filtered result.

## Day-of check-in

- Search by name, email, phone, or vehicle.
- Filter by all, checked-in, and not-checked-in states and by entry type.
- Sort by unchecked first, name, or most recent.
- Mark a registrant checked in or undo check-in.
- Track payment as unpaid, paid, or waived.
- Summary totals and progress by entry type.

## Organizer checklist

- 54 fixed tasks across immediate, sponsors/fundraising, logistics/setup, marketing/promotion, day-of, and post-event sections.
- Section progress, overall progress, collapse/expand, and clear-all behavior.
- Checkmarks intentionally remain in browser local storage, matching the current live behavior. Progress is per browser/device.

## Image archive

- Builds a ZIP with section folders, README, and CSV manifest.
- Includes Etch-managed site images, sponsor logos, gallery photos, and coloring-book media.
- Excludes portal accounts, registrations, contacts, and private migration data.

## User Admin

- Creates and edits independent Crafty Kates portal accounts.
- Assigns portal roles and per-tool capabilities.
- Activates/deactivates users, requires password changes, and revokes active portal sessions.
- Does not read or write WordPress users, roles, capabilities, sessions, or cookies.
