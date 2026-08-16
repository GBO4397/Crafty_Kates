# WS Form build sheet

WS Form PRO owns all public forms. Add each shortcode directly to the matching Etch HTML panel. WS Form supports this natively.

Do not hand-code a competing HTML/PHP form in the Crafty Kates plugin. Do not make portal users WordPress users.

## Forms

1. Contact — save submission, email site owner, success message, spam protection.
2. Newsletter — email, consent, upsert into the selected email provider or retain in WS Form submissions; no CRM work is in scope.
3. Car Show Registration — conditional vehicle/vendor/cackle sections, liability and photo consent, confirmation email, and the `ckp_wsform_registration` action after the submission is created.
4. Submit Story — use Post Management to create a standard Post in pending/draft status with uploaded featured image.
5. Submit Event — use Post Management to create `ck_event` in draft status and map ACF fields; force `review_status=pending`.
6. Submit Coloring Book — create `ck_color_book` in draft status; the cover and page uploads remain in Etch Asset Manager-compatible attachment storage. Page-child creation is handled during the reviewed publishing workflow.

Build from `form-specs.json`, then export each completed form from WS Form as JSON into `exports/`. WS Form changes field IDs on import and automatically updates its own actions, but the registration bridge map must be regenerated after the final import.

## Registration bridge

Add a **Run WordPress Hook** action to the Car Show Registration form:

- Run on: Submit
- Type: Action (`do_action`)
- Hook tag: `ckp_wsform_registration`
- Priority: After submission created, before notification actions

Copy `registration-field-map.example.json`, replace every value with the final WS Form field ID, transfer it privately, then run:

```bash
wp crafty-kates wsform-map /private/registration-field-map.json
```

Verify with `wp crafty-kates status`. The field map contains IDs only and may be stored in the deployment repository; exported submissions and personal data must not.
